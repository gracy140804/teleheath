'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Activity,
    Globe,
    Zap,
    PieChart,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Cpu,
    Network,
    LineChart,
    X,
    Layers,
    Server,
    Shield
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function AdminAnalytics() {
    const [showRoadmap, setShowRoadmap] = useState(false);

    const kpis = [
        { label: "Active Nodes", value: "142", trend: "+4", color: "#7C3AED", bg: "bg-[#7C3AED]/10" },
        { label: "Throughput", value: "8.4k", trend: "+1.2k", color: "#C4B5FD", bg: "bg-[#C4B5FD]/10" },
        { label: "Success Rate", value: "99.8%", trend: "0.2%", color: "#7C3AED", bg: "bg-[#7C3AED]/10" },
        { label: "Latency", value: "42ms", trend: "-5ms", color: "#C4B5FD", bg: "bg-[#C4B5FD]/10" },
    ];

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">System Analytics</h2>
                    <p className="text-[#636E72] text-base font-medium opacity-60">Deep data immersion into platform architecture and global engagement.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => alert("Adjusting Quantum Window. Available presets: 24H, 7D, 30D, 90D. Access Restricted to Level 5.")}
                        className="bg-white border border-[#E8E4D9] text-[#2D3436] px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-[#FDFBF7] transition-all flex items-center gap-3 group"
                    >
                        Quantum Window: 30D <ChevronDown className="w-4 h-4 text-[#7C3AED]" />
                    </button>
                    <button 
                        onClick={() => alert("Re-calculating platform intelligence metrics... Data Refreshed.")}
                        className="bg-[#7C3AED] text-white p-4 rounded-[1.5rem] shadow-xl shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <LineChart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[3rem] border border-[#E8E4D9] shadow-sm flex flex-col gap-6 hover:shadow-xl hover:border-[#7C3AED]/30 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-bl-[4rem] group-hover:bg-[#7C3AED]/10 transition-colors"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#636E72] opacity-60 relative z-10">{kpi.label}</p>
                        <div className="flex items-end justify-between relative z-10">
                            <h4 className="text-4xl font-black text-[#2D3436] tracking-tighter tabular-nums">{kpi.value}</h4>
                            <div className="flex items-center gap-1 mb-1.5 bg-[#2ECC71]/10 px-2 py-1 rounded-lg border border-[#2ECC71]/10">
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#2ECC71]" />
                                <span className="text-[10px] font-black text-[#2ECC71]">{kpi.trend}</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#E8E4D9] relative z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: idx % 2 === 0 ? '85%' : '65%' }}
                                transition={{ duration: 1.5, delay: idx * 0.2, ease: "circOut" }}
                                className="h-full rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: kpi.color, color: kpi.color }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-[#E8E4D9] shadow-sm group">
                    <div className="flex items-center justify-between mb-16 gap-6">
                        <div className="text-left">
                            <h3 className="text-2xl font-black tracking-tight text-[#2D3436] flex items-center gap-4 uppercase tracking-tighter">
                                <TrendingUp className="w-8 h-8 text-[#7C3AED]" />
                                Growth Trajectory
                            </h3>
                            <p className="text-[10px] font-black uppercase text-[#636E72] mt-2 tracking-[0.2em] opacity-50">Projected vs Actual Ecosystem Scaling</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
                                <span className="text-[9px] font-black uppercase text-[#636E72]">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#7C3AED]/20"></div>
                                <span className="text-[9px] font-black uppercase text-[#636E72]">Target</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-6 px-4 relative">
                        {/* Fake Grid lines */}
                        <div className="absolute inset-x-0 h-[1px] bg-[#E8E4D9]/30 bottom-1/4" />
                        <div className="absolute inset-x-0 h-[1px] bg-[#E8E4D9]/30 bottom-1/2" />
                        <div className="absolute inset-x-0 h-[1px] bg-[#E8E4D9]/30 bottom-3/4" />

                        {[40, 55, 45, 70, 60, 85, 80, 100, 90, 75, 85, 95].map((val, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group/bar relative z-10">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                                    className="w-full max-w-[18px] bg-gradient-to-t from-[#7C3AED]/40 to-[#7C3AED] group-hover/bar:from-[#7C3AED] group-hover/bar:to-[#5B21B6] rounded-t-full transition-all duration-300 relative cursor-pointer shadow-[0_4px_12px_rgba(124,58,237,0.1)]"
                                >
                                    <div className="absolute -top-1 w-full h-1.5 bg-[#7C3AED] rounded-full scale-110 opacity-0 group-hover/bar:opacity-100 transition-all shadow-[0_0_15px_#7C3AED]" />
                                </motion.div>
                                <span className="text-[9px] font-black text-[#636E72] mt-6 uppercase tracking-widest opacity-30 group-hover/bar:opacity-100 transition-opacity">Q{Math.ceil((i + 1) / 3)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-[#2D3436] p-12 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center text-center group relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#7C3AED]/10 rounded-full blur-[80px]"></div>
                    <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-4 uppercase tracking-tighter mb-12">
                        <Globe className="w-8 h-8 text-[#C4B5FD]" />
                        Scope
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative scale-110">
                        <div className="relative w-56 h-56">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="28" strokeLinecap="round" />
                                <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    fill="transparent" stroke="#7C3AED" strokeWidth="28" 
                                    strokeDasharray="264" 
                                    initial={{ strokeDashoffset: 264 }}
                                    animate={{ strokeDashoffset: 80 }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    strokeLinecap="round" 
                                />
                                <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    fill="transparent" stroke="#C4B5FD" strokeWidth="28" 
                                    strokeDasharray="264" 
                                    initial={{ strokeDashoffset: 264 }}
                                    animate={{ strokeDashoffset: 220 }}
                                    transition={{ duration: 2.5, ease: "circOut", delay: 0.5 }}
                                    strokeLinecap="round" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white tracking-tighter">84%</span>
                                <span className="text-[9px] font-black uppercase text-[#636E72] tracking-[0.2em] mt-1">Global Reach</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 space-y-5 w-full">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#7C3AED] shadow-[0_0_10px_#7C3AED]" />
                                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Urban Nodes</span>
                            </div>
                            <span className="text-base font-black text-white">62%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#C4B5FD] shadow-[0_0_10px_#C4B5FD]" />
                                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Frontier</span>
                            </div>
                            <span className="text-base font-black text-white">22%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scaling Initiative */}
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] p-16 rounded-[4rem] text-white shadow-2xl shadow-[#7C3AED]/40 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 group">
                <div className="relative z-10 lg:max-w-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-white/10 rounded-[1.5rem] border border-white/20">
                            <Cpu className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Infrastructure Scaling <span className="text-[#C4B5FD]">2026</span></h4>
                    </div>
                    <p className="text-white/80 font-medium text-lg leading-relaxed mb-12 max-w-xl italic opacity-90">Current resource utilization is at <span className="text-white font-black underline decoration-[#C4B5FD] underline-offset-8">65% capacity</span>. Quantum-ready infrastructure expansion planned for Q3 to ensure sustained sub-10ms global latency metrics.</p>
                    <div className="flex gap-4"> {/* Added a div to contain the buttons */}
                        <button 
                            onClick={() => setShowRoadmap(true)}
                            className="bg-white text-[#7C3AED] px-12 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 group"
                        >
                            Architecture Roadmap
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => alert("System Pulse: Aura-Core Node 14 reporting optimal performance. Latency: 4ms. Integrity: 99.99%.")}
                            className="bg-white text-[#2D3436] px-10 py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#7C3AED] hover:text-white transition-all duration-500 hover:scale-105 active:scale-95"
                        >
                            Pulse Check
                        </button>
                    </div>
                </div>
                <div className="relative w-full lg:w-96 h-64 flex items-center justify-center">
                    <Network className="w-full h-full text-white opacity-10 absolute scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-[24deg] group-hover:scale-[1.7]" />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 2 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl relative z-20"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4">Live Throughput</p>
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-4xl font-black">1.2 TB/s</p>
                                <p className="text-[9px] font-black text-[#2ECC71] mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> OPTIMIZED</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Roadmap Modal */}
            <AnimatePresence>
                {showRoadmap && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setShowRoadmap(false)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-[#636E72]" />
                            </button>

                            <div className="p-12">
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="p-4 bg-[#7C3AED]/10 rounded-2xl">
                                        <Layers className="w-10 h-10 text-[#7C3AED]" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Architecture Roadmap</h3>
                                        <p className="text-sm font-bold text-[#7C3AED] uppercase tracking-[0.2em] opacity-60">System Scaling & Infrastructure</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-black">Q3</div>
                                            <div className="flex-1 w-[2px] bg-slate-100 my-2"></div>
                                        </div>
                                        <div className="pb-8">
                                            <p className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Quantum-Ready Expansion</p>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed">Upgrading core nodes to support 1M+ concurrent active global sessions with sub-10ms latency.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black">Q4</div>
                                            <div className="flex-1 w-[2px] bg-slate-100 my-2"></div>
                                        </div>
                                        <div className="pb-8">
                                            <p className="text-base font-black text-slate-400 mb-1 uppercase tracking-tight">AI Diagnostic Layer V2</p>
                                            <p className="text-sm font-medium text-slate-400 leading-relaxed italic opacity-70">Implementation of specialized neural engines for ultra-fast medical imaging processing.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black">2027</div>
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-400 mb-1 uppercase tracking-tight">Global Mesh Network</p>
                                            <p className="text-sm font-medium text-slate-400 leading-relaxed italic opacity-70">Decentralized patient data nodes for 100% data sovereignty and ultra-redundant uptime.</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowRoadmap(false)}
                                    className="w-full mt-12 bg-[#7C3AED] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all"
                                >
                                    Dismiss Intel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
