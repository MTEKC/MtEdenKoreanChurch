'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Success! Send them to the Admin Dashboard
            router.push('/admin');
        } catch {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">관리자 로그인</h2>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}
