'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Clock, Mail, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export default function SupportModal({ isOpen, onClose, lang }: SupportModalProps) {
    const [step, setStep] = React.useState<'info' | 'callback' | 'success'>('info');
    const [loading, setLoading] = React.useState(false);

    const handleCallbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep('success');
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {step === 'info' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                            {lang === 'ta' ? "தொலைபேசி ஆதரவு" : "Phone Support"}
                                        </h2>
                                        <p className="text-slate-500 font-medium">
                                            {lang === 'ta' ? "உங்களுக்கு உதவ நாங்கள் தயாராக உள்ளோம்" : "We're here to help you get the care you need."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">+1 (800) HEALTH-AI</p>
                                                <p className="text-sm text-slate-500">General Care & Billing</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">24/7 Availability</p>
                                                <p className="text-sm text-slate-500">Medical assistants available now</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep('callback')}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {lang === 'ta' ? "ஆலோசனை கோரவும்" : "Request Callback"}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}

                            {step === 'callback' && (
                                <form onSubmit={handleCallbackSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Request Callback</h2>
                                        <p className="text-slate-500 font-medium">A support agent will call you within 15 minutes.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Jane Doe"
                                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-primary focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-primary focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep('info')}
                                            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            disabled={loading}
                                            className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Submitting..." : "Submit Request"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 'success' && (
                                <div className="py-12 text-center space-y-6">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-slate-900">Request Confirmed</h2>
                                        <p className="text-slate-500 font-medium">Your request has been prioritized. Expect a call shortly at your provided number.</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
