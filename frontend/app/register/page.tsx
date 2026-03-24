'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, UserPlus, ChevronDown, User, Stethoscope, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/components/LanguageContext';

export default function RegisterPage() {
    const { t, lang } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('auth/register', {
                name,
                email,
                password,
                role
            });

            // Auto login after successful registration or redirect to login
            router.push('/login?registered=true');

        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-background flex antialiased text-foreground ${lang === 'ta' ? 'font-tamil' : 'font-inter'}`}>
            {/* Split Screen Container */}
            <div className="flex w-full overflow-hidden">
                {/* Left side: Premium Medical Blue */}
                <div className="hidden lg:flex w-[40%] bg-primary flex-col justify-center items-center p-8 text-white relative">
                    <div className="relative z-10 max-w-sm mb-6">
                        <div className="bg-white/10 p-2.5 rounded-xl inline-block mb-4">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 tracking-tight">{t.landingTitle}</h1>
                        <p className="text-base text-blue-100/90 font-medium leading-relaxed">
                            {t.heroSub}
                        </p>
                    </div>
                </div>

                {/* Right side: Minimal Auth Form */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    <div className="w-full max-w-sm py-2">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in relative">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">{t.createAccount}</h2>
                                <p className="text-muted font-medium text-xs">{t.joinNetwork}</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                {error && (
                                    <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-error text-xs font-semibold flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}

                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                        {[
                                            { id: 'PATIENT', icon: User, label: t.patient || 'Patient' },
                                            { id: 'DOCTOR', icon: Stethoscope, label: t.doctor || 'Doctor' }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setRole(option.id as any)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    role === option.id 
                                                    ? 'bg-white text-primary shadow-sm' 
                                                    : 'text-muted hover:text-foreground'
                                                }`}
                                            >
                                                <option.icon className="w-4 h-4" />
                                                <span>{lang === 'ta' ? (option.id === 'PATIENT' ? 'நோயாளி' : 'மருத்துவர்') : option.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground mb-2 block">{t.fullName}</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white border border-slate-200 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm text-foreground"
                                        placeholder={lang === 'ta' ? "பெயர்" : "Jane Doe"}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground mb-2 block">{t.emailAddr}</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-200 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm text-foreground"
                                        placeholder={t.enterEmail}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground mb-2 block">{t.password}</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-200 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm text-foreground"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full btn-primary py-2.5 active:scale-[0.98] disabled:opacity-70 transition-all font-bold mt-1"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>{t.signup}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center border-t border-slate-100 pt-4">
                                <p className="text-muted text-sm font-medium">
                                    {t.alreadyAccount}{" "}
                                    <Link href="/login" className="text-primary font-bold hover:underline">
                                        {t.signin}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Back Link */}
                        <Link href="/" className="text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center justify-center gap-2">
                            ← {t.backToHome}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

