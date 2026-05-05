'use client';

import Navbar from '@/components/Navbar';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate sending email
        setTimeout(() => {
            alert("Thank you! Your message has been sent.");
            setLoading(false);
            // Reset form logic here if needed
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
            <Navbar />

            {/* Header Section */}
            <div className="bg-blue-600 text-white py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                <p className="text-blue-100 max-w-2xl mx-auto px-4">
                    We would love to hear from you. Whether you have a prayer request, a question,
                    or just want to say hello, feel free to reach out.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">

                    {/* Left Column: Contact Information */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Visit Us</h3>
                                    <p className="text-gray-600">
                                        449 Mount Eden Road, Mount Eden, <br />Auckland, New Zealand
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <Phone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Call Us</h3>
                                    <p className="text-gray-600">Rev. Han    027 514 1121</p>
                                    <p className="text-gray-600">Rev. Shin   021 126 8180</p>
                                    <p className="text-sm text-gray-400">Mon-Fri, 9am - 5pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                                    <p className="text-gray-600">mtedenkoreanchurch@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Embedded Map */}
                        <div className="h-64 w-full bg-gray-200 rounded-xl overflow-hidden shadow-sm mt-8">
                            {/* <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.493922363167!2d174.6291!3d-36.8636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d3f0a1b2c3d4e%3A0x1234567890abcdef!2s22%20Edmonton%20Rd%2C%20Henderson%2C%20Auckland!5e0!3m2!1sen!2snz!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                            ></iframe> */}
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6382.656091442055!2d174.75900667741848!3d-36.882499781393975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d4632b82dd291%3A0xf748835c68dd93a9!2sMt%20Eden%20Village%20Centre!5e0!3m2!1sko!2snz!4v1770990091280!5m2!1sko!2snz"
                                width="600"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows={4}
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </main>
    );
}
