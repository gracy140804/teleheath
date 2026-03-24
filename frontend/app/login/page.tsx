'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, LogIn, ChevronDown, User, Stethoscope, ShieldCheck, Eye, EyeOff, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/components/LanguageContext';

export default function LoginPage() {
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('auth/login', {
                email: email.trim().toLowerCase(),
                password
            });
            const { access_token, role: userRole, user_id } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user_role', userRole);
            localStorage.setItem('user_id', user_id.toString());

            if (userRole === 'ADMIN') router.push('/admin');
            else if (userRole === 'DOCTOR') router.push('/doctor/dashboard');
            else router.push('/patient/dashboard');

        } catch (err: any) {
            if (!err.response) {
                setError('Network error: Could not reach the server. Please check your connection.');
            } else {
                const errorMessage = err.response?.data?.detail || 'Invalid credentials. Please try again.';
                setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-background flex antialiased text-foreground ${lang === 'ta' ? 'font-tamil' : 'font-inter'}`}>
            {/* Split Screen Container */}
            <div className="flex w-full overflow-hidden">
                {/* Left side: Premium Medical Blue */}
                <div className="hidden lg:flex w-[40%] bg-primary flex-col justify-center items-center p-12 text-white relative">
                    <div className="relative z-10 max-w-sm mb-8">
                        <div className="bg-white/10 p-2.5 rounded-xl inline-block mb-6">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 tracking-tight">{t.landingTitle}</h1>
                        <p className="text-base text-blue-100/90 font-medium leading-relaxed">
                            {t.heroSub}
                        </p>
                    </div>
                </div>

                {/* Right side: Minimal Auth Form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-8">
                    <div className="w-full max-w-sm">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in relative">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">{t.welcomeBack}</h2>
                                <p className="text-muted font-medium text-xs">{t.signinDesc}</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-error text-xs font-semibold flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}

                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                        {[
                                            { id: 'PATIENT', icon: User, label: t.patient || 'Patient' },
                                            { id: 'DOCTOR', icon: Stethoscope, label: t.doctor || 'Doctor' },
                                            { id: 'ADMIN', icon: ShieldCheck, label: 'Admin' }
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
                                                <span className="hidden sm:inline">{lang === 'ta' ? (option.id === 'PATIENT' ? 'நோயாளி' : option.id === 'DOCTOR' ? 'மருத்துவர்' : 'நிர்வாகி') : option.label}</span>
                                            </button>
                                        ))}
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
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-foreground block">{t.password}</label>
                                        <Link href="/forgot-password" title="password" className="text-[11px] font-bold text-primary hover:underline">
                                           Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative group/passwd">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within/passwd:text-primary transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border border-slate-200 py-2.5 pl-10 pr-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm text-foreground"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full btn-primary py-2.5 active:scale-[0.98] disabled:opacity-70 transition-all font-bold mt-2"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4" />
                                            <span>{t.signin}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center border-t border-slate-100 pt-4">
                                <p className="text-muted text-xs font-medium">
                                    {t.noAccount}{" "}
                                    <Link href="/register" className="text-primary font-bold hover:underline">
                                        {t.signup}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Back Link */}
                        <div className="mt-6 text-center">
                            <Link href="/" className="text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center justify-center gap-2">
                                ← {t.backToHome}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


