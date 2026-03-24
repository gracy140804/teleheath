'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 antialiased font-inter">
            <div className="w-full max-w-sm">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                    
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[#1E293B] mb-2">Reset Password</h2>
                        <p className="text-xs text-slate-500 font-medium">Enter your email and we'll send you reset instructions.</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </motion.div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm text-slate-900 disabled:opacity-50"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-4"
                            >
                                <CheckCircle2 className="w-6 h-6" />
                            </motion.div>
                            <div className="text-sm font-bold text-green-600 mb-2">Instructions Sent</div>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
                                If an account exists for {email}, a recovery link has been dispatched to your inbox.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="w-3 h-3" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
