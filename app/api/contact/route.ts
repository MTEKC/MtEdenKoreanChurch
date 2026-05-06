import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

interface ContactRequestBody {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
}

function readText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);
  const body = (await request.json()) as ContactRequestBody;

  if (readText(body.company, 120)) {
    return NextResponse.json({ ok: true });
  }

  const firstName = readText(body.firstName, 80);
  const lastName = readText(body.lastName, 80);
  const email = readText(body.email, 254);
  const message = readText(body.message, 5000);
  const name = [firstName, lastName].filter(Boolean).join(' ');

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL ?? 'mtedenkoreanchurch@gmail.com';
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'Mt Eden Methodist Church <onboarding@resend.dev>';

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <h2>New contact form message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: email,
    subject: `New contact message from ${name}`,
    text,
    html,
  });

  if (error) {
    console.error('Resend contact email error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
