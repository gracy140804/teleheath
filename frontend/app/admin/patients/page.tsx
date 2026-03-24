'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    Calendar,
    Activity,
    FileText,
    ChevronRight,
    MapPin,
    AlertCircle,
    Download,
    UserPlus,
    Clock,
    HeartPulse,
    X
} from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminPatients() {
    const searchParams = useSearchParams();
    const filterParam = searchParams.get('filter');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUrgentFilter, setIsUrgentFilter] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
    const [timeline, setTimeline] = useState<any[]>([]);
    const [showTimelineView, setShowTimelineView] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (filterParam === 'urgent') {
            setIsUrgentFilter(true);
        }
    }, [filterParam]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/patients');
            setPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const viewPatientDetails = async (id: number) => {
        try {
            const res = await api.get(`/admin/patient/${id}`);
            setSelectedPatient(res.data);
            setShowTimelineView(false);
            setShowModal(true);
        } catch (err) {
            console.error("Failed to fetch patient details:", err);
            alert("Could not load patient details.");
        }
    };

    const fetchTimeline = async (id: number) => {
        try {
            const res = await api.get(`/admin/patient/${id}/timeline`);
            setTimeline(res.data);
            setShowTimelineView(true);
        } catch (err) {
            console.error("Failed to fetch timeline:", err);
            alert("Could not load clinical timeline.");
        }
    };

    const sortedPatients = [...patients].sort((a, b) => {
        const dateA = new Date(a.joined).getTime();
        const dateB = new Date(b.joined).getTime();
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    const filteredPatients = sortedPatients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.id.toString().includes(searchTerm);
        
        const matchesUrgent = isUrgentFilter ? p.status === 'URGENT' : true;
        
        return matchesSearch && matchesUrgent;
    });

    const handleExport = () => {
        if (patients.length === 0) return;
        
        const headers = ["ID", "Name", "Email", "Joined", "Appointments", "Last Active"];
        const csvRows = [
            headers.join(','),
            ...patients.map(p => [
                p.id,
                `"${p.name}"`,
                p.email,
                p.joined,
                p.appointments,
                `"${p.lastActive}"`
            ].join(','))
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aurahealth_engagement_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">Patient Demographics</h2>
                    <p className="text-[#636E72] text-base font-medium opacity-60">Insight into active engagement metrics and global health indicators.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="bg-white border border-[#E8E4D9] text-[#2D3436] px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-[#FDFBF7] active:scale-95 transition-all flex items-center gap-3 group"
                >
                    <Download className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                    Export Engagement Data
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Directory */}
                <div className="xl:col-span-2 bg-white rounded-[3.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden border-b-[10px] border-b-[#C4B5FD]">
                    <div className="p-10 border-b border-[#E8E4D9]/50 flex items-center justify-between flex-wrap gap-6 bg-[#FDFBF7]/30">
                        <div className="flex items-center gap-4 bg-white border border-[#E8E4D9] rounded-[1.2rem] px-6 py-3 w-full max-w-md focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10 transition-all duration-300">
                            <Search className="w-5 h-5 text-[#636E72]" />
                            <input 
                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-[#2D3436] placeholder-[#636E72]/50" 
                                placeholder="Filter by patient ID or identity..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {isUrgentFilter && (
                                <button 
                                    onClick={() => {
                                        setIsUrgentFilter(false);
                                        router.push(pathname);
                                    }}
                                    className="px-6 py-3 rounded-[1.2rem] bg-[#E17055] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#E17055]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Urgent Filter
                                </button>
                            )}
                            <button 
                                onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
                                className={`px-6 py-3 rounded-[1.2rem] border text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center gap-2 ${
                                    sortOrder === 'latest' ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-white text-[#636E72] border-[#E8E4D9] hover:bg-[#FDFBF7]'
                                }`}
                            >
                                <Clock className="w-4 h-4" />
                                {sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FDFBF7]">
                                <tr>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Identity Profile</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Consultations</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Status</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9] text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E4D9]/50">
                                {loading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-10 py-10"><div className="h-12 bg-[#FDFBF7] rounded-[1.5rem] w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredPatients.map((p) => (
                                    <tr key={p.id} className="hover:bg-[#FDFBF7]/40 transition-colors duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xs shadow-inner border transition-all ${
                                                    p.status === 'URGENT' 
                                                    ? 'bg-[#E17055]/10 text-[#E17055] border-[#E17055]/30 ring-4 ring-[#E17055]/5' 
                                                    : 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20'
                                                }`}>
                                                    #{p.id.toString().padStart(4, '0')}
                                                </div>
                                                <div>
                                                    <p className="font-black text-base tracking-tight text-[#2D3436] group-hover:text-[#7C3AED] transition-colors flex items-center gap-2">
                                                        {p.name}
                                                        {p.status === 'URGENT' && (
                                                            <span className="w-2 h-2 rounded-full bg-[#E17055] animate-ping" />
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-[#636E72] tracking-tight uppercase opacity-50">Joined {p.joined}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-base text-[#2D3436] tracking-tight">{p.appointments}</span>
                                                <p className="text-[9px] font-black text-[#636E72] uppercase tracking-widest opacity-40">Sessions COMPLETED</p>
                                            </div>
                                            <div className="w-16 h-1 bg-[#E8E4D9] rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-[#C4B5FD]" style={{ width: `${Math.min((p.appointments/15)*100, 100)}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    p.status === 'URGENT' 
                                                    ? 'bg-[#E17055]/10 text-[#E17055] border-[#E17055]/20 shadow-[0_0_12px_rgba(225,112,85,0.2)]' 
                                                    : 'bg-[#FDFBF7] text-[#636E72] border-[#E8E4D9]'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => viewPatientDetails(p.id)}
                                                className="w-10 h-10 rounded-xl bg-[#FDFBF7] border border-[#E8E4D9] flex items-center justify-center text-[#636E72] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 transition-all duration-300 active:scale-90"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-10">
                    <div className="bg-[#7C3AED] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-[#7C3AED]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-white/10 transition-colors"></div>
                        <Activity className="w-12 h-12 text-[#C4B5FD] mb-8 group-hover:rotate-12 transition-transform duration-500" />
                        <h4 className="text-2xl font-black mb-4 tracking-tight uppercase tracking-tighter">System Efficiency</h4>
                        <p className="text-[#C4B5FD] font-medium text-base mb-10 leading-relaxed opacity-90 italic">92% success rate in AI-assisted triage and preliminary diagnostics.</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                                <span>Optimization</span>
                                <span>92%</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2 shadow-inner border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '92%' }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="bg-white h-full rounded-full shadow-[0_0_15px_white]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] border border-[#E8E4D9] shadow-sm border-t-[10px] border-t-[#E17055] group hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[#E17055]/10 rounded-[1.2rem] flex items-center justify-center border border-[#E17055]/20">
                                <AlertCircle className="w-6 h-6 text-[#E17055]" />
                            </div>
                            <h4 className="text-xl font-black text-[#2D3436] tracking-tight uppercase tracking-widest">Urgent Anomalies</h4>
                        </div>
                        <p className="text-[#636E72] font-medium text-base mb-10 leading-relaxed opacity-70 italic">3 patients have reported high-severity indicators in the last 60 minutes. Immediate intervention review advised.</p>
                        <button 
                            onClick={async () => {
                                const btn = document.activeElement as HTMLButtonElement;
                                if (!btn) return;
                                
                                const originalText = btn.innerText;
                                try {
                                    btn.innerText = "ESCALATING...";
                                    btn.disabled = true;
                                    
                                    await api.post('/admin/escalate');
                                    
                                    btn.innerText = "PROTOCOL ACTIVE";
                                    btn.classList.add('bg-green-600', 'text-white');
                                    
                                    setTimeout(() => {
                                        btn.innerText = originalText;
                                        btn.disabled = false;
                                        btn.classList.remove('bg-green-600', 'text-white');
                                    }, 5000);
                                } catch (err) {
                                    console.error("Escalation failed:", err);
                                    btn.innerText = "FAILED TO ESCALATE";
                                    btn.disabled = false;
                                    setTimeout(() => btn.innerText = originalText, 3000);
                                }
                            }}
                            className="w-full py-4 bg-[#E17055]/5 hover:bg-[#E17055] text-[#E17055] hover:text-white rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] border border-[#E17055]/10 transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            <HeartPulse className="w-4 h-4" />
                            Escalation Protocol
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Detail Modal */}
            <AnimatePresence>
                {showModal && selectedPatient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-[#636E72]" />
                            </button>

                            <div className="p-12">
                                <div className="flex items-center gap-8 mb-10">
                                    <div className="w-24 h-24 rounded-[2rem] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black text-3xl shadow-inner border border-[#7C3AED]/20">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPatient.name}</h3>
                                        <p className="text-lg font-bold text-[#7C3AED] uppercase tracking-widest">Patient #{selectedPatient.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>

                                {!showTimelineView ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-8 mb-10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / Gender</p>
                                                <p className="text-base font-bold text-slate-700">{selectedPatient.age || 'N/A'} • {selectedPatient.gender || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</p>
                                                <p className="text-base font-bold text-red-500">{selectedPatient.blood_group || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</p>
                                                <p className="text-base font-bold text-slate-700">{selectedPatient.phone || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Date</p>
                                                <p className="text-base font-bold text-slate-700">{selectedPatient.joined}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical History</p>
                                                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">{selectedPatient.medical_history || 'No established medical history records yet.'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => fetchTimeline(selectedPatient.id)}
                                                className="flex-1 bg-[#7C3AED] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all"
                                            >
                                                Full Timeline
                                            </button>
                                            <button 
                                                onClick={() => setShowModal(false)}
                                                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical History Timeline</h4>
                                            <button 
                                                onClick={() => setShowTimelineView(false)}
                                                className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest hover:underline"
                                            >
                                                Back to Profile
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                            {timeline.length > 0 ? timeline.map((event, idx) => (
                                                <div key={event.id} className="relative pl-8 pb-6 border-l-2 border-slate-100 last:border-0">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#7C3AED]" />
                                                    <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 group hover:border-[#7C3AED]/30 transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-black text-slate-900 group-hover:text-[#7C3AED] transition-colors">{event.title}</p>
                                                            <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400 uppercase">{event.date}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500 mb-2">{event.details}</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                            event.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 
                                                            event.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {event.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-20 opacity-30">
                                                    <Activity className="w-16 h-16 mx-auto mb-4" />
                                                    <p className="font-black uppercase tracking-widest text-xs">No clinical events recorded</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => setShowModal(false)}
                                            className="w-full bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all mt-4"
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
        </div>
    );
}
