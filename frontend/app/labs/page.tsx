'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Download,
    Calendar,
    TrendingUp,
    FileText,
    Search,
    ChevronRight,
    Beaker,
    CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';

export default function LabResultsPage() {
    const router = useRouter();
    const { t, lang } = useLanguage();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        setTimeout(() => {
            setResults([
                { id: 1, test: lang === 'ta' ? "முழு இரத்த எண்ணிக்கை (CBC)" : "Complete Blood Count (CBC)", date: "2026-02-28", status: lang === 'ta' ? "இயல்பானது" : "Normal", value: lang === 'ta' ? "சரியான அளவில்" : "Within Range", clinic: "City General Labs" },
                { id: 2, test: lang === 'ta' ? "லிப்பிட் பேனல்" : "Lipid Panel", date: "2026-01-15", status: lang === 'ta' ? "கவனம்" : "Attention", value: lang === 'ta' ? "சிறிது அதிகமாக உள்ளது" : "Slightly Elevated", clinic: "HealthAI Diagnostics" },
                { id: 3, test: lang === 'ta' ? "இரத்த குளுக்கோஸ்" : "Blood Glucose", date: "2025-12-10", status: lang === 'ta' ? "இயல்பானது" : "Normal", value: "95 mg/dL", clinic: "City General Labs" },
            ]);
            setLoading(false);
        }, 800);
    }, [lang]);

    const handleResultClick = (res: any) => {
        console.log("Result clicked:", res.test);
        setSelectedTest(res.test);
        alert(lang === 'ta' ?
            `${res.test} விவரங்கள்: ${res.clinic} ஆல் வழங்கப்பட்டது. நிலை: ${res.status}` :
            `Details for ${res.test}: Provided by ${res.clinic}. Status: ${res.status}`);
    };

    const handleScheduleTest = () => {
        router.push('/labs/schedule');
    };

    if (!isMounted) {
        return (
            <MainLayout title="Lab Results">
                <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                    <div className="h-20 bg-slate-100 rounded-3xl w-1/3" />
                    <div className="space-y-6">
                        <div className="h-24 bg-slate-100 rounded-2xl" />
                        <div className="h-24 bg-slate-100 rounded-2xl" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Lab Results">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t.labs}</h1>
                        <p className="text-slate-500 font-medium mt-1">{t.subtitle}</p>
                        {selectedTest && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-primary/10 text-primary rounded-xl text-sm font-bold border border-primary/20 flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {lang === 'ta' ? `தேர்ந்தெடுக்கப்பட்டது: ${selectedTest}` : `Selected: ${selectedTest}`}
                            </motion.div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="btn-secondary py-2.5 px-6 gap-2"
                            onClick={() => alert(lang === 'ta' ? "அனைத்து முடிவுகளும் PDF ஆக பதிவிறக்கம் செய்யப்படுகின்றன..." : "Exporting all results as PDF...")}
                        >
                            <Download className="w-4 h-4" />
                            Export All (PDF)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))
                        ) : results.map((res) => (
                            <motion.div
                                key={res.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => handleResultClick(res)}
                                className="hospital-card flex items-center justify-between group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl shrink-0 ${res.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{res.test}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {res.date}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">•</span>
                                            <span className="text-xs font-semibold text-slate-400">{res.clinic}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className={`text-sm font-bold ${res.status === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>{res.value}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{res.status}</p>
                                    </div>
                                    <button className="p-2.5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary text-slate-400 transition-all">
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                            <TrendingUp className="w-8 h-8 text-sky-400 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Health Trend</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">Your overall health markers are stable. Cholesterol levels show a downward trend since last quarter.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Confidence</span>
                                    <span className="font-black text-sky-400">98% MED-AI</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="w-[98%] h-full bg-sky-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="hospital-card border-dotted border-2 flex flex-col items-center text-center py-10">
                            <Beaker className="w-10 h-10 text-primary/40 mb-4" />
                            <p className="text-sm font-bold text-slate-600 mb-4">Request New Lab Work</p>
                            <button
                                onClick={handleScheduleTest}
                                className="btn-primary py-2 px-6 text-xs uppercase tracking-widest active:scale-95 transition-transform"
                            >
                                Schedule Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
