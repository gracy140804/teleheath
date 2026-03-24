'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Mic,
    Calendar,
    FileText,
    Stethoscope,
    ChevronRight,
    Clock,
    Video
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';
import api from '@/lib/api';

export default function PatientDashboard() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, lang } = useLanguage();
    const router = useRouter();

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patient/appointments');
            setAppointments(res.data);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const stats = [
        {
            label: t.upcoming, value: appointments.find(a => a.status === 'CONFIRMED')?.appointment_datetime
                ? new Date(appointments.find(a => a.status === 'CONFIRMED').appointment_datetime).toLocaleDateString()
                : "None", sub: appointments.find(a => a.status === 'CONFIRMED')?.doctor_name || "No Doctor", icon: <Clock className="w-6 h-6 text-[#2563EB]" />, bg: "bg-[#2563EB]/10"
        },
        { label: t.totalConsults, value: appointments.length.toString(), sub: lang === 'ta' ? "2024 முதல்" : "Since 2024", icon: <Stethoscope className="w-6 h-6 text-[#E17055]" />, bg: "bg-[#E17055]/10" },
        { label: t.lastPrescription, value: "None", sub: "N/A", icon: <FileText className="w-6 h-6 text-[#0984E3]" />, bg: "bg-[#0984E3]/10" },
    ];

    const handleViewPrescription = (fileUrl: string) => {
        if (!fileUrl) return;
        if (fileUrl.startsWith('http')) {
            window.open(fileUrl, '_blank');
            return;
        }
        let base = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
        const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
        const fullUrl = `${base}${path}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <MainLayout title="Patient Dashboard">
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-2">{t.welcome}</h2>
                        <p className="text-[#636E72] text-base font-medium">{t.subtitle}</p>
                    </div>
                    <Link href="/symptoms" className="btn-primary py-4 px-8 font-black shadow-lg shadow-[#2563EB]/20 gap-3 flex items-center group transition-all">
                        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {t.recordSymptoms}
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-[#E8E4D9] shadow-sm flex flex-col gap-6 hover:shadow-xl hover:border-[#2563EB]/30 transition-all group"
                        >
                            <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#636E72]/60 mb-2">{stat.label}</p>
                                <p className="text-2xl font-black text-[#2D3436] tracking-tight">{stat.value}</p>
                                <p className="text-xs font-bold text-[#2563EB] mt-1">{stat.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-[#E8E4D9]/50 flex items-center justify-between bg-[#FDFBF7]/30">
                        <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tight">
                            <Calendar className="w-6 h-6 text-[#2563EB]" />
                            <span>{t.recentAppointments}</span>
                        </h3>
                        <Link href="/appointments" className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-xs font-black hover:bg-[#2563EB] hover:text-white transition-all">{t.viewHistory}</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FDFBF7]">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Doctor</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Date & Time</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E4D9]/50">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-[#FDFBF7] rounded-full w-full"></div></td>
                                        </tr>
                                    ))
                                ) : (appointments || []).map((apt) => (
                                    <tr key={apt.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                                        <td className="px-8 py-6">
                                           <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center font-black text-[#2563EB]">
                                                {apt.doctor_name?.charAt(0) || 'D'}
                                              </div>
                                              <span className="font-black text-sm text-[#2D3436] tracking-tight">{apt.doctor_name || 'Doctor'}</span>
                                           </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-[#636E72] font-bold">
                                            {new Date(apt.appointment_datetime).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                                                apt.status === 'CONFIRMED' ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' :
                                                apt.status === 'PENDING' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7]' :
                                                apt.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {apt.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => router.push(`/patient/video-call/${apt.id}?roomId=${apt.video_room_id}`)}
                                                        className="bg-[#2563EB] text-white h-10 px-5 rounded-[1rem] text-[11px] font-black flex items-center gap-2 hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/20 transition-all active:scale-95"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Join Call
                                                    </button>
                                                )}
                                                {apt.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => apt.prescription_url ? handleViewPrescription(apt.prescription_url) : router.push('/prescriptions')}
                                                        className="bg-blue-50 text-blue-600 border border-blue-100 h-10 px-5 rounded-[1rem] text-[11px] font-black flex items-center gap-2 hover:bg-blue-100 transition-all active:scale-95"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        {apt.prescription_url ? "View Prescription" : t.viewPrescriptions}
                                                    </button>
                                                )}
                                                <button className="p-2 rounded-full hover:bg-[#FDFBF7] text-[#636E72] transition-colors">
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!loading && (!appointments || appointments.length === 0)) && (
                            <div className="p-16 text-center text-[#636E72] text-sm font-bold italic bg-[#FDFBF7]/10">
                                No upcoming appointments found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    {[
                        { title: t.viewPrescriptions, icon: <FileText className="w-6 h-6" />, color: "text-[#0984E3]", bg: "bg-[#0984E3]/10", href: "/prescriptions" },
                        { title: t.reviewLabs, icon: <Activity className="w-6 h-6" />, color: "text-[#6C5CE7]", bg: "bg-[#6C5CE7]/10", href: "/labs" },
                        { title: t.patientSupport, icon: <Stethoscope className="w-6 h-6" />, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10", href: "/support" },
                    ].map((action, idx) => (
                        <Link
                            key={idx}
                            href={action.href}
                            className="bg-white p-7 border border-[#E8E4D9] rounded-[2rem] flex items-center justify-between hover:border-[#2563EB]/50 hover:shadow-2xl transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`p-4 ${action.bg} ${action.color} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                                    {action.icon}
                                </div>
                                <span className="font-black text-base text-[#2D3436] tracking-tight">{action.title}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDFBF7] text-[#636E72] group-hover:bg-[#2563EB] group-hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
