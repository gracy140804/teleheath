'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    Stethoscope,
    Calendar,
    BarChart3,
    ShieldCheck,
    Search,
    CheckCircle2,
    XCircle,
    UserPlus,
    Check,
    X,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Lock,
    Zap
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Weekly');

    useEffect(() => {
        // Sample data for demonstration
        setTimeout(() => {
            setDoctors([
                { id: 1, name: "Dr. Mark Wilson", specialization: "Cardiology", experience: "12 years", status: "PENDING" },
                { id: 2, name: "Dr. Elena Gilbert", specialization: "Neurology", experience: "8 years", status: "PENDING" },
                { id: 3, name: "Dr. Stefan Salvatore", specialization: "Dermatology", experience: "15 years", status: "PENDING" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const stats = [
        { label: "Total Users", value: "24,512", icon: <Users className="w-6 h-6 text-[#7C3AED]" />, bg: "bg-[#7C3AED]/10", trend: "+12%", color: "#7C3AED", href: "/admin/analytics" },
        { label: "Total Doctors", value: "1,204", icon: <Stethoscope className="w-6 h-6 text-[#C4B5FD]" />, bg: "bg-[#C4B5FD]/10", trend: "+5%", color: "#C4B5FD", href: "/admin/doctors" },
        { label: "Total Patients", value: "23,308", icon: <UserPlus className="w-6 h-6 text-[#7C3AED]" />, bg: "bg-[#7C3AED]/10", trend: "+18%", color: "#7C3AED", href: "/admin/patients" },
        { label: "Total Appointments", value: "48,154", icon: <Calendar className="w-6 h-6 text-[#C4B5FD]" />, bg: "bg-[#C4B5FD]/10", trend: "+24%", color: "#C4B5FD", href: "/admin/appointments" },
    ];

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">Platform Intelligence</h2>
                    <p className="text-[#636E72] text-base font-medium opacity-60">Real-time oversight of AuraHealth ecosystem and compliance.</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-[#E8E4D9] p-3 rounded-[1.5rem] shadow-sm">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-[#7C3AED]/10 flex items-center justify-center text-[10px] font-black text-[#7C3AED] shadow-sm uppercase">
                                AD
                            </div>
                        ))}
                    </div>
                    <div className="pr-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#636E72] block opacity-50">Operational Access</span>
                        <span className="text-xs font-black text-[#7C3AED]">Level 5 Authorized</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <Link key={idx} href={stat.href}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[3rem] border border-[#E8E4D9] shadow-sm flex flex-col gap-8 hover:shadow-xl hover:border-[#7C3AED]/30 transition-all group relative overflow-hidden cursor-pointer h-full"
                        >
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#7C3AED]/5 rounded-full blur-2xl group-hover:bg-[#7C3AED]/10 transition-colors"></div>
                            <div className="flex items-center justify-between w-full relative z-10">
                                <div className={`${stat.bg} w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-6`}>
                                    {stat.icon}
                                </div>
                                <div className="flex items-center gap-1 bg-[#2ECC71]/10 text-[#2ECC71] px-3 py-1.5 rounded-full text-[10px] font-black border border-[#2ECC71]/20">
                                    <TrendingUp className="w-3 h-3" />
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#636E72] mb-2 opacity-60">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-[#2D3436] tracking-tight">{stat.value}</p>
                                    <ArrowUpRight className="w-4 h-4 text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Approval Queue Section */}
            <div className="bg-white rounded-[3.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden border-t-[10px] border-t-[#7C3AED]">
                <div className="p-10 border-b border-[#E8E4D9]/50 flex items-center justify-between flex-wrap gap-6 bg-[#FDFBF7]/30">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-[#2D3436] flex items-center gap-4">
                            <ShieldCheck className="w-8 h-8 text-[#7C3AED]" />
                            <span>Practitioner Verification Queue</span>
                        </h3>
                        <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] mt-2 opacity-50 ml-12">Action required for platform compliance</p>
                    </div>
                    <div className="bg-[#E17055]/5 text-[#E17055] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-[#E17055]/10 animate-pulse">
                        <Activity className="w-4 h-4" />
                        3 Validations Pending
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDFBF7]">
                            <tr>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Provider Information</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Specialization</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Credentials</th>
                                <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9] text-right">Approval Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4D9]/50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-10 py-10"><div className="h-12 bg-[#FDFBF7] rounded-[1.5rem] w-full"></div></td>
                                    </tr>
                                ))
                            ) : doctors.map((doc) => (
                                <tr key={doc.id} className="hover:bg-[#FDFBF7]/40 transition-colors duration-300">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black text-sm uppercase shadow-sm border border-[#7C3AED]/20 tracking-widest">{doc.name.split(' ')[1][0]}</div>
                                            <div>
                                                <span className="font-black text-base tracking-tight text-[#2D3436] block mb-1">{doc.name}</span>
                                                <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest">Medical ID: #DR-{300 + doc.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#7C3AED]/40"></div>
                                            <span className="text-sm text-[#2D3436] font-black tracking-tight">{doc.specialization}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <span className="text-[11px] text-[#636E72] font-black uppercase tracking-[0.15em] bg-white border border-[#E8E4D9] px-4 py-1.5 rounded-full shadow-sm">{doc.experience} Experience</span>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button className="bg-[#7C3AED] text-white p-4 rounded-[1.2rem] shadow-xl shadow-[#7C3AED]/20 hover:scale-110 active:scale-95 transition-all duration-300">
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button className="bg-white text-[#636E72] p-4 rounded-[1.2rem] border border-[#E8E4D9] hover:bg-[#E17055]/10 hover:text-[#E17055] hover:border-[#E17055]/20 transition-all duration-300 shadow-sm active:scale-95">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Matrix Section */}
            <div className="bg-[#2D3436] p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-[#7C3AED]/20 transition-all duration-700"></div>
                
                <div className="flex flex-wrap items-center justify-between mb-16 gap-8 relative z-10">
                    <div>
                        <h3 className="text-3xl font-black tracking-tight text-white flex items-center gap-4 uppercase tracking-tighter">
                            <BarChart3 className="w-8 h-8 text-[#C4B5FD]" />
                            Performance Matrix
                        </h3>
                        <p className="text-[#636E72] text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-80">Global Network Throughput and Latency</p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-[1.5rem] border border-white/5">
                        {['Daily', 'Weekly', 'Monthly'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-[1.2rem] transition-all duration-300 ${activeTab === tab ? 'bg-[#7C3AED] text-white shadow-xl shadow-[#7C3AED]/30' : 'text-white/40 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-end justify-between h-64 gap-5 px-4 overflow-hidden relative z-10">
                    {[35, 60, 40, 85, 55, 75, 95, 70, 50, 65, 85, 100, 80, 90, 60, 45, 75].map((val, i) => (
                        <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group/bar">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ duration: 1.5, delay: i * 0.05, ease: "circOut" }}
                                className={`w-full max-w-[14px] min-h-[6px] rounded-full transition-all duration-500 relative cursor-pointer group-hover/bar:brightness-125 ${i % 2 === 0 ? 'bg-[#7C3AED] shadow-[0_0_15px_#7C3AED]/50' : 'bg-[#C4B5FD] shadow-[0_0_15px_#C4B5FD]/30'}`}
                            >
                                <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white text-[#2D3436] text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl transition-all duration-300 pointer-events-none whitespace-nowrap">
                                    {val}% Throughput
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#7C3AED]/50 transition-colors">
                                <Zap className="w-6 h-6 text-[#7C3AED]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#636E72] mb-1">Peak Utilization</p>
                                <p className="text-xl font-black text-white leading-none tracking-tight">09:00 - 11:30 <span className="text-[10px] text-[#7C3AED]">UTC</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#7C3AED]/50 transition-colors">
                                <Activity className="w-6 h-6 text-[#C4B5FD]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#636E72] mb-1">Response Latency</p>
                                <p className="text-xl font-black text-white leading-none tracking-tight">2.4ms <span className="text-[10px] text-[#2ECC71]">STABLE</span></p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => alert("Intelligence Audit Exported. Check your secure downloads folder.")}
                        className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-[1.5rem] border border-white/10 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <Lock className="w-4 h-4 text-[#7C3AED]" />
                        Export Intelligence Audit
                    </button>
                </div>
            </div>
        </div>
    );
}
