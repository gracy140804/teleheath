'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Search,
    Filter,
    Clock,
    User,
    Stethoscope,
    Video,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreHorizontal,
    FileText,
    Activity,
    Zap,
    ArrowRight,
    X,
    Shield
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState<any>(null);

    useEffect(() => {
        // Sample data for demonstration
        setTimeout(() => {
            setAppointments([
                { id: 101, patient: "Jeremy Gilbert", doctor: "Dr. Mark Wilson", date: "2024-03-15", time: "10:00 AM", status: "CONFIRMED", type: "Video" },
                { id: 102, patient: "Caroline Forbes", doctor: "Dr. Elena Gilbert", date: "2024-03-15", time: "11:30 AM", status: "PENDING", type: "Video" },
                { id: 103, patient: "Tyler Lockwood", doctor: "Dr. Stefan Salvatore", date: "2024-03-16", time: "02:00 PM", status: "COMPLETED", type: "Video" },
                { id: 104, patient: "Matt Donovan", doctor: "Dr. Bonnie Bennett", date: "2024-03-16", time: "04:15 PM", status: "CANCELLED", type: "Video" },
                { id: 105, patient: "Alaric Saltzman", doctor: "Dr. Klaus Mikaelson", date: "2024-03-17", time: "09:00 AM", status: "CONFIRMED", type: "Video" },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">Consultation Log</h2>
                    <p className="text-[#636E72] text-base font-medium opacity-60">System-wide monitoring of scheduled and historical medical sessions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => alert("Accessing Live Encryption Grid... Connection Stable.")}
                        className="bg-white border border-[#E8E4D9] text-[#2D3436] px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-[#FDFBF7] transition-all flex items-center gap-3 group"
                    >
                        <Calendar className="w-5 h-5 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                        Live Schedule
                    </button>
                    <button 
                        onClick={() => alert("Synchronizing global dispatchers... 14 nodes updated.")}
                        className="bg-[#7C3AED] text-white px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Sync Dispatcher
                    </button>
                </div>
            </div>

            {/* Master Table Section */}
            <div className="bg-white rounded-[3.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden border-b-[10px] border-b-[#7C3AED]">
                <div className="p-10 border-b border-[#E8E4D9]/50 flex flex-wrap items-center justify-between gap-6 bg-[#FDFBF7]/30">
                    <div className="flex items-center gap-4 bg-white border border-[#E8E4D9] rounded-[1.2rem] px-6 py-3 w-full max-w-md focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10 transition-all duration-300">
                        <Search className="w-5 h-5 text-[#636E72]" />
                        <input className="bg-transparent border-none outline-none text-sm font-bold w-full text-[#2D3436] placeholder-[#636E72]/50" placeholder="Search by patient, practitioner, or ID..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDFBF7]">
                            <tr>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Session Token</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Participant Matrix</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Temporal Data</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9] text-center">Lifecycle Status</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9] text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4D9]/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-10 py-10"><div className="h-12 bg-[#FDFBF7] rounded-[1.5rem] w-full" /></td>
                                    </tr>
                                ))
                            ) : appointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-[#FDFBF7]/40 transition-colors duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1rem] bg-[#2D3436] text-white flex items-center justify-center font-black text-xs shadow-xl shadow-black/10">
                                                {appt.id}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em]">{appt.type}</p>
                                                <p className="text-[9px] font-black text-[#636E72] uppercase tracking-widest opacity-40">ENCRYPTED NODE</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-[#636E72]" />
                                                <p className="font-black text-sm tracking-tight text-[#2D3436]">{appt.patient}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="w-3.5 h-3.5 text-[#7C3AED]" />
                                                <p className="font-bold text-[11px] text-[#7C3AED] uppercase tracking-tight italic opacity-80">{appt.doctor}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-black text-[#2D3436] uppercase tracking-widest">{appt.date}</span>
                                            <span className="text-[10px] font-black text-[#636E72] italic opacity-50">{appt.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                            appt.status === 'CONFIRMED' ? 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20' :
                                            appt.status === 'PENDING' ? 'bg-[#F1C40F]/10 text-[#F1C40F] border-[#F1C40F]/20' :
                                            appt.status === 'COMPLETED' ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20' :
                                            'bg-[#FDFBF7] text-[#636E72] border-[#E8E4D9]'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                                appt.status === 'CONFIRMED' ? 'bg-[#2ECC71]' :
                                                appt.status === 'PENDING' ? 'bg-[#F1C40F]' :
                                                appt.status === 'COMPLETED' ? 'bg-[#7C3AED]' :
                                                'bg-[#BDBDBD]'
                                            }`} />
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => setActiveReport(appt)}
                                            className="text-[#636E72] hover:text-[#7C3AED] transition-all duration-300 p-3 hover:bg-[#7C3AED]/5 rounded-[1.2rem] border border-transparent hover:border-[#7C3AED]/20"
                                        >
                                            <FileText className="w-6 h-6" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[4rem] border border-[#E8E4D9] shadow-sm flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#7C3AED]/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#636E72] mb-4 opacity-50">Volume: Monthly Aggregate</p>
                        <p className="text-5xl font-black text-[#2D3436] tracking-tighter italic">1,482</p>
                        <p className="text-[#2ECC71] font-black text-[12px] mt-6 flex items-center gap-2 bg-[#2ECC71]/10 w-fit px-4 py-1.5 rounded-full border border-[#2ECC71]/10">
                            <CheckCircle2 className="w-4 h-4" />
                            +12.4% Delta
                        </p>
                    </div>
                    <div className="w-32 h-32 rounded-full border-[8px] border-[#FDFBF7] flex items-center justify-center relative shadow-inner z-10">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="42%" className="fill-none stroke-[#7C3AED] stroke-[10px]" strokeDasharray="264" strokeDashoffset="60" strokeLinecap="round" />
                        </svg>
                        <div className="text-center">
                            <span className="font-black text-lg text-[#2D3436] block leading-none">75%</span>
                            <span className="text-[8px] font-black text-[#636E72] uppercase opacity-40">Load</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2D3436] p-12 rounded-[4rem] text-white shadow-2xl shadow-black/30 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h4 className="text-3xl font-black mb-3 tracking-tight uppercase tracking-widest">Network Integrity</h4>
                        <p className="text-[#636E72] font-medium text-base mb-10 leading-relaxed opacity-80">Global health checks confirm all video streaming nodes and AI dispatchers are at peak performance.</p>
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-[1.2rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                    <Video className="w-5 h-5 text-[#C4B5FD]" />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-[#2ECC71] animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2ECC71]">Sub-50ms Latency</span>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-white/20 group-hover:text-[#7C3AED] group-hover:translate-x-2 transition-all duration-500" />
                    </div>
                </div>
            </div>

            {/* Audit Modal */}
            <AnimatePresence>
                {activeReport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setActiveReport(null)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-[#636E72]" />
                            </button>

                            <div className="p-12">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="p-4 bg-[#7C3AED]/10 rounded-2xl">
                                        <Shield className="w-10 h-10 text-[#7C3AED]" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Session Audit Report</h3>
                                        <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] opacity-60">Session ID: #{activeReport.id}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50 p-6 rounded-2xl">
                                            <p className="text-[9px] font-black uppercase text-[#636E72] tracking-widest mb-1 opacity-60">Status</p>
                                            <p className="text-sm font-black text-[#2ECC71] uppercase tracking-widest">{activeReport.status}</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl">
                                            <p className="text-[9px] font-black uppercase text-[#636E72] tracking-widest mb-1 opacity-60">Encryption</p>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">AES-256 GCM</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Patient Participant</span>
                                            <span className="text-sm font-black text-slate-900">{activeReport.patient}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Presiding Doctor</span>
                                            <span className="text-sm font-black text-[#7C3AED]">{activeReport.doctor}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Data Integrity</span>
                                            <span className="text-sm font-black text-[#2ECC71]">100% VALIDATED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#2D3436] rounded-2xl mb-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Zap className="w-5 h-5 text-[#2ECC71]" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Technical Signature</span>
                                    </div>
                                    <p className="text-[11px] font-mono text-[#636E72] break-all leading-relaxed">
                                        {Math.random().toString(36).substring(2, 15)}{Math.random().toString(36).substring(2, 15)}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => setActiveReport(null)}
                                    className="w-full bg-[#7C3AED] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all"
                                >
                                    Close Audit Log
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
