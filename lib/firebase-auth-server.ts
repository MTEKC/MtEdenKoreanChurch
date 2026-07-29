interface FirebaseLookupUser {
  localId: string;
  email?: string;
}

interface FirebaseLookupResponse {
  users?: FirebaseLookupUser[];
}

export class AuthError extends Error {
  status = 401;
}

export async function requireFirebaseUser(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!token || !apiKey) {
    throw new AuthError('Firebase 로그인 정보가 없습니다. 다시 로그인해 주세요.');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken: token }),
  });

  if (!response.ok) {
    throw new AuthError('Firebase 로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.');
  }

  const data = (await response.json()) as FirebaseLookupResponse;
  const user = data.users?.[0];

  if (!user) {
    throw new AuthError('Firebase 로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.');
  }

  return user;
}
