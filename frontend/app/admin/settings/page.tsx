'use client';

import React from 'react';
import {
    Settings,
    Shield,
    Bell,
    Globe,
    Lock,
    Eye,
    LifeBuoy,
    ChevronRight,
    Zap,
    Cpu,
    Database,
    ShieldCheck,
    Terminal,
    Key,
    X,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function AdminSettings() {
    const [activeSection, setActiveSection] = useState<any>(null);

    const sections = [
        { title: "System Infrastructure", icon: Cpu, desc: "Global platform parameters and core API integrations.", color: "#7C3AED", bg: "bg-[#7C3AED]/10" },
        { title: "Security & Access", icon: ShieldCheck, desc: "Manage administrative roles and multi-factor authentication.", color: "#C4B5FD", bg: "bg-[#C4B5FD]/10" },
        { title: "Notification Logic", icon: Bell, desc: "Configure system-wide alerts and automated email dispatches.", color: "#7C3AED", bg: "bg-[#7C3AED]/10" },
        { title: "Compliance Hub", icon: Lock, desc: "Update medical data privacy policies and platform terms.", color: "#C4B5FD", bg: "bg-[#C4B5FD]/10" },
        { title: "Database Architecture", icon: Database, desc: "Monitor clustering, replication, and data integrity nodes.", color: "#7C3AED", bg: "bg-[#7C3AED]/10" },
        { title: "Developer Console", icon: Terminal, desc: "API key management and webhook configuration.", color: "#C4B5FD", bg: "bg-[#C4B5FD]/10" },
    ];

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">System Control</h2>
                    <p className="text-[#636E72] text-base font-medium opacity-60">High-level technical configuration and security matrix management.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => alert("Master Credentials Access Requested. Please provide Level 5 Auth.")}
                        className="bg-[#7C3AED] text-white px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <Key className="w-4 h-4" />
                        Master Credentials
                    </button>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setActiveSection(section)}
                        className="bg-white p-10 rounded-[3rem] border border-[#E8E4D9] shadow-sm flex flex-col items-start justify-between hover:border-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/5 transition-all duration-500 text-left outline-none group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-bl-[4rem] group-hover:bg-[#7C3AED]/10 transition-colors"></div>
                        <div className="mb-10 relative z-10">
                            <div className={`${section.bg} w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-6`}>
                                <section.icon className="w-8 h-8" style={{ color: section.color }} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black text-[#2D3436] tracking-tight uppercase tracking-tighter mb-2">{section.title}</h4>
                            <p className="text-[#636E72] font-medium text-sm leading-relaxed opacity-60 italic mb-8">{section.desc}</p>
                            <div className="flex items-center gap-2 text-[#7C3AED] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                                Configure Parameters
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* System Status Node */}
            <div className="bg-[#2D3436] p-12 rounded-[4rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[80px] -ml-32 -mt-32"></div>
                <div className="flex items-center gap-8 relative z-10">
                    <div className="bg-white/5 text-[#7C3AED] w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl border border-white/10 group-hover:border-[#7C3AED]/30 transition-all duration-500">
                        <Zap className="w-12 h-12 shadow-[0_0_20px_#7C3AED]/50" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#636E72] mb-1">Compute Environment</p>
                        <h4 className="text-3xl font-black text-white tracking-tighter uppercase tracking-widest">Aura-Core Node 14</h4>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] animate-pulse shadow-[0_0_10px_#2ECC71]" />
                            <span className="text-[#2ECC71] font-black text-[11px] uppercase tracking-[0.2em]">Operational & Optimized</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div className="bg-white/5 px-8 py-5 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase text-[#636E72] tracking-[0.2em] mb-2 text-center opacity-60">Control Matrix Version</p>
                        <p className="text-lg font-black text-white tracking-tight text-center">v2.6.4-LATEST</p>
                    </div>
                    <button 
                        onClick={() => alert("System Pulse: All nodes reporting optimal performance. Latency: 4ms.")}
                        className="bg-white text-[#2D3436] px-10 py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#7C3AED] hover:text-white transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                        Pulse Check
                    </button>
                </div>
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {activeSection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setActiveSection(null)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-[#636E72]" />
                            </button>

                            <div className="p-10 text-center">
                                <div className="mb-8 flex justify-center">
                                    <div className={`${activeSection.bg} w-24 h-24 rounded-[2rem] flex items-center justify-center`}>
                                        <activeSection.icon className="w-12 h-12" style={{ color: activeSection.color }} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{activeSection.title}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10 italic">"{activeSection.desc}"</p>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl mb-10 text-left space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Status</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Active / Optimized</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Protocol</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Aura-TLS v3.2</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        alert(`Modifying ${activeSection.title} requires Technical Lead override.`);
                                        setActiveSection(null);
                                    }}
                                    className="w-full bg-[#7C3AED] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all"
                                >
                                    Modify Configuration
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer Attribution */}
            <div className="max-w-xl mx-auto text-center space-y-6 pt-12">
                <p className="text-[10px] font-black uppercase text-[#636E72] tracking-[0.4em] opacity-40">AuraHealth Enterprise Architecture 2026</p>
                <div className="flex flex-wrap items-center justify-center gap-10">
                    {['Documentation', 'Systems API', 'Privacy Shield', 'Node Map'].map((item) => (
                        <button key={item} className="text-[11px] font-black text-[#636E72] hover:text-[#7C3AED] transition-all duration-300 uppercase tracking-widest opacity-60 hover:opacity-100 italic">
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
