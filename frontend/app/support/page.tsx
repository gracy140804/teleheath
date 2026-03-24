'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Phone,
    Mail,
    ShieldCheck,
    ArrowRight,
    LifeBuoy,
    HelpCircle,
    FileQuestion
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';
import { useState, useEffect } from 'react';
import SupportModal from '@/components/SupportModal';
import LiveChatOverlay from '@/components/LiveChatOverlay';

export default function SupportPage() {
    const { t, lang } = useLanguage();
    const [isMounted, setIsMounted] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <MainLayout title="Patient Support"><div className="min-h-screen animate-pulse bg-slate-50/50 rounded-3xl" /></MainLayout>;

    return (
        <MainLayout title="Patient Support">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LifeBuoy className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">{lang === 'ta' ? "நாங்கள் உங்களுக்கு எப்படி உதவ முடியும்?" : "How can we help you?"}</h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">{lang === 'ta' ? "எங்கள் அர்ப்பணிப்புள்ள மருத்துவ ஆதரவு குழு மற்றும் மருத்துவ உதவியாளர்கள் உங்கள் தேவைகளுக்காக 24/7 தயாராக உள்ளனர்." : "Our dedicated clinical support team and medical assistants are available 24/7 for your needs."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.button
                        whileHover={{ y: -4 }}
                        onClick={() => setShowChat(true)}
                        className="hospital-card p-8 flex flex-col items-start gap-6 text-left group"
                    >
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">{lang === 'ta' ? "நேரடி அரட்டை" : "Live Chat"}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">{lang === 'ta' ? "உண்மையான நேரத்தில் ஒரு மருத்துவ உதவியாளரிடம் பேசுங்கள். சராசரி காத்திருப்பு: < 2 நிமிடம்." : "Talk to a medical assistant in real-time. Average wait: < 2 mins."}</p>
                            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                {lang === 'ta' ? "அமர்வைத் தொடங்கவும்" : "Start Session"} <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -4 }}
                        onClick={() => setShowSupportModal(true)}
                        className="hospital-card p-8 flex flex-col items-start gap-6 text-left group"
                    >
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Phone Support</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">Schedule a call with our billing or medical records department.</p>
                            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                Request Recall <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </motion.button>
                </div>

                <SupportModal
                    isOpen={showSupportModal}
                    onClose={() => setShowSupportModal(false)}
                    lang={lang}
                />

                <LiveChatOverlay
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    lang={lang}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <HelpCircle className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">FAQ Database</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <FileQuestion className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">Policy Center</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">Email Inquiry</span>
                    </div>
                </div>

                <div className="p-10 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{t.emergency}</h3>
                            <p className="text-blue-50/70 text-sm font-medium">{t.emergencyText}</p>
                        </div>
                    </div>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20">
                        {t.emergencyCall}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
