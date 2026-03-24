'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Calendar,
    User,
    Pill,
    Search,
    Clock,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';
import api from '@/lib/api';

export default function PrescriptionsPage() {
    const { t, lang } = useLanguage();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            setLoading(true);
            try {
                const res = await api.get('/patient/prescriptions');
                setPrescriptions(res.data);
            } catch (err) {
                console.error("Failed to fetch prescriptions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    const handleDownload = (fileUrl: string) => {
        if (!fileUrl) return;
        
        // If it's already a full URL, use it
        if (fileUrl.startsWith('http')) {
            window.open(fileUrl, '_blank');
            return;
        }

        // Clean up base URL (remove /api and trailing slash)
        let base = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
        
        // Ensure path starts with exactly one slash
        const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
        
        const fullUrl = `${base}${path}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <MainLayout title="My Prescriptions">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{lang === 'ta' ? 'எனது மருந்துகள்' : 'My Prescriptions'}</h1>
                        <p className="text-slate-500 font-medium mt-1">{lang === 'ta' ? 'உங்கள் மருத்துவ வரலாறு மற்றும் மருந்துகள்' : 'Your medical history and prescribed medications'}</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636E72]/50" />
                        <input
                            type="text"
                            placeholder="Search medications..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))
                    ) : prescriptions.length === 0 ? (
                        <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">{lang === 'ta' ? 'மருந்துகள் எதுவும் காணப்படவில்லை.' : 'No prescriptions found yet.'}</p>
                        </div>
                    ) : prescriptions.map((px) => (
                        <motion.div
                            key={px.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-8 group hover:shadow-xl hover:border-[#2563EB]/20 transition-all"
                        >
                            <div className="flex-1 flex items-start gap-6">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                                    <Pill className="w-8 h-8" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">Prescription for Appointment #{px.appointment_id}</h3>
                                        <p className="text-sm font-semibold text-slate-500 flex items-center gap-2 mt-1">
                                            <User className="w-4 h-4" />
                                            Prescribed by {px.doctor_name}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Calendar className="w-4 h-4 text-[#2563EB]" />
                                            {new Date(px.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Status: Available
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl border border-dotted border-slate-200">
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-widest block mb-1">Notes / Instructions</span>
                                            {px.notes || "No additional notes provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:border-l border-slate-100 md:pl-8 flex flex-col justify-center gap-3">
                                <button
                                    onClick={() => handleDownload(px.file_url)}
                                    className="bg-[#2563EB] text-white py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] transition-all active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => alert(lang === 'ta' ? "மறு நிரப்புதல் கோரிக்கை அனுப்பப்பட்டது!" : "Refill request sent to your doctor!")}
                                    className="bg-white text-slate-600 border border-slate-200 py-3 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Request Refill
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
