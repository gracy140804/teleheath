'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Search,
    Filter,
    MoreVertical,
    Check,
    X,
    UserCircle,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    AlertCircle,
    Plus,
    Star,
    ArrowUpRight,
    Eye
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        experience: 'all',
        specialization: 'all',
        status: 'all'
    });

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data);
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/admin/approve-doctor?doctor_id=${id}`);
            alert("Doctor approved successfully!");
            fetchDoctors();
        } catch (err) {
            console.error("Approval failed:", err);
            alert("Failed to approve doctor.");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject/suspend this doctor?")) return;
        try {
            await api.post(`/admin/reject-doctor?doctor_id=${id}`);
            alert("Doctor status updated!");
            fetchDoctors();
        } catch (err) {
            console.error("Rejection failed:", err);
            alert("Failed to reject doctor.");
        }
    };

    const viewDetails = async (id: number) => {
        try {
            const res = await api.get(`/admin/doctor/${id}`);
            setSelectedDoctor(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("Failed to fetch details:", err);
            alert("Could not load doctor details.");
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesExp = filterOptions.experience === 'all' || 
                         (filterOptions.experience === '10+' && parseInt(doc.experience) >= 10) ||
                         (filterOptions.experience === '0-5' && parseInt(doc.experience) <= 5);
        const matchesStatus = filterOptions.status === 'all' || doc.status === filterOptions.status;
        
        return matchesSearch && matchesExp && matchesStatus;
    });

    return (
        <div className="space-y-12 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-1 uppercase tracking-tight">Medical Personnel</h2>
                    <p className="text-[#636E72] text-sm font-medium opacity-60">Manage credentials, approvals, and platform visibility for practitioners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="bg-[#7C3AED] text-white px-6 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Invite Practitioner
                    </button>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-[#E8E4D9]/50 flex items-center justify-between flex-wrap gap-4 bg-[#FDFBF7]/30">
                    <div className="flex items-center gap-3 bg-white border border-[#E8E4D9] rounded-[1rem] px-5 py-2.5 w-full max-w-sm focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10 transition-all duration-300">
                        <Search className="w-4.5 h-4.5 text-[#636E72]" />
                        <input
                            className="bg-transparent border-none outline-none text-xs font-bold w-full text-[#2D3436] placeholder-[#636E72]/50"
                            placeholder="Search by name or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowFilterModal(true)}
                            className="flex items-center gap-2.5 px-5 py-2.5 rounded-[1rem] bg-white border border-[#E8E4D9] text-[10px] font-black uppercase tracking-widest text-[#636E72] hover:bg-[#FDFBF7] transition-all duration-300 shadow-sm active:scale-95"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Refine Results
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDFBF7]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Practitioner Profile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Clinical Focus</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Quality Score</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9]">Platform Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#636E72] uppercase tracking-[0.2em] border-b border-[#E8E4D9] text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4D9]/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-10 py-10"><div className="h-16 bg-[#FDFBF7] rounded-[1.5rem] w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredDoctors.map((doc) => (
                                <tr key={doc.id} className="hover:bg-[#FDFBF7]/40 transition-colors duration-300 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-[1.2rem] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black text-xs shadow-inner border border-[#7C3AED]/20 uppercase">
                                                {doc.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm tracking-tight text-[#2D3436] group-hover:text-[#7C3AED] transition-colors">{doc.name}</p>
                                                <p className="text-[9px] font-bold text-[#636E72] tracking-tight flex items-center gap-1.5 mt-0.5 opacity-60">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    {doc.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] bg-[#7C3AED]/5 px-3 py-1.5 rounded-[0.8rem] block w-fit shadow-sm border border-[#7C3AED]/10">{doc.specialization || 'General'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex items-center gap-1 text-[#F1C40F]">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-xs font-black text-[#2D3436]">{doc.rating || 0}</span>
                                            </div>
                                            <div className="h-1 w-10 bg-[#E8E4D9] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#7C3AED]" style={{ width: `${((doc.rating || 0)/5)*100}%` }}></div>
                                            </div>
                                        </div>
                                        <p className="text-[8px] font-black text-[#636E72] uppercase tracking-widest mt-0.5 opacity-40">Patient Satisfaction</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit ${
                                            doc.status === 'APPROVED' ? 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20' :
                                            doc.status === 'PENDING' ? 'bg-[#F1C40F]/10 text-[#F1C40F] border-[#F1C40F]/20' :
                                            'bg-[#E17055]/10 text-[#E17055] border-[#E17055]/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                                                doc.status === 'APPROVED' ? 'bg-[#2ECC71]' :
                                                doc.status === 'PENDING' ? 'bg-[#F1C40F]' :
                                                'bg-[#E17055]'
                                            }`} />
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2.5 transition-all duration-300">
                                            <button 
                                                onClick={() => viewDetails(doc.id)}
                                                className="bg-white text-[#636E72] p-2.5 rounded-[0.8rem] border border-[#E8E4D9] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all shadow-sm active:scale-95"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            {doc.status !== 'APPROVED' && (
                                                <button 
                                                    onClick={() => handleApprove(doc.id)}
                                                    className="bg-[#2ECC71] text-white p-2.5 rounded-[0.8rem] shadow-xl shadow-[#2ECC71]/20 hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            {doc.status !== 'SUSPENDED' && (
                                                <button 
                                                    onClick={() => handleReject(doc.id)}
                                                    className="bg-[#E17055] text-white p-2.5 rounded-[0.8rem] shadow-xl shadow-[#E17055]/20 hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-10 border-t border-[#E8E4D9]/50 bg-[#FDFBF7]/30 flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#636E72] opacity-50">Intelligence: {filteredDoctors.length} Verified results</p>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3].map(i => (
                            <button key={i} className={`w-10 h-10 rounded-[1rem] text-[11px] font-black transition-all duration-300 ${i === 1 ? 'bg-[#7C3AED] text-white shadow-xl shadow-[#7C3AED]/30' : 'bg-white text-[#636E72] hover:bg-[#FDFBF7] border border-[#E8E4D9] shadow-sm'}`}>
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] p-12 rounded-[4rem] text-white shadow-2xl shadow-[#7C3AED]/30 relative overflow-hidden group">
                    <div className="relative z-10">
                        <ShieldCheck className="w-14 h-14 text-[#C4B5FD] mb-8 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-3xl font-black mb-3 tracking-tight uppercase tracking-widest">Compliance Integrity</h4>
                        <p className="text-[#C4B5FD] font-medium mb-10 text-base max-w-sm leading-relaxed opacity-90">98.4% of practitioners are currently meeting AuraHealth's clinical excellence and regulatory standards.</p>
                        <button className="bg-white/10 hover:bg-white text-[#7C3AED] hover:text-[#7C3AED] transition-all duration-300 border border-white/20 px-10 py-4 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em]">
                            Examine Audit Matrix
                        </button>
                    </div>
                    <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-[20deg] group-hover:scale-[1.6]">
                        <Stethoscope className="w-72 h-72" />
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border border-[#E8E4D9] shadow-sm flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-3 h-3 rounded-full bg-[#F1C40F] animate-pulse shadow-[0_0_10px_#F1C40F]" />
                            <h4 className="text-2xl font-black text-[#2D3436] tracking-tight uppercase tracking-widest">Awaiting Verification</h4>
                        </div>
                        <p className="text-[#636E72] font-medium text-base mb-12 leading-relaxed opacity-70">There are <span className="text-[#7C3AED] font-black">12</span> practitioner profiles in the validation pipeline requiring credential confirmation.</p>
                    </div>
                    <div className="flex items-center justify-between pt-10 border-t border-[#E8E4D9]/50 mt-auto">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-[#FDFBF7] shadow-lg flex items-center justify-center text-[11px] font-black text-[#7C3AED] uppercase" title="Practitioner">
                                    DR
                                </div>
                            ))}
                        </div>
                        <button className="bg-[#7C3AED]/5 hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white px-8 py-4 rounded-[1.5rem] border border-[#7C3AED]/10 text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 group">
                            Review Queue
                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shadow-lg border border-white/10">
                                <span className="font-black text-[11px]">12</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Doctor Detail Modal */}
            <AnimatePresence>
                {showModal && selectedDoctor && (
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
                                        {selectedDoctor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDoctor.name}</h3>
                                        <p className="text-lg font-bold text-[#7C3AED] uppercase tracking-widest">{selectedDoctor.specialization}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                        <p className="text-base font-bold text-slate-700">{selectedDoctor.experience}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualification</p>
                                        <p className="text-base font-bold text-slate-700">{selectedDoctor.qualification}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                                        <p className="text-base font-bold text-slate-700">₹{selectedDoctor.consultation_fee}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</p>
                                        <p className="text-base font-bold text-slate-700">{selectedDoctor.email}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {selectedDoctor.is_approved ? (
                                        <button 
                                            onClick={() => { handleReject(selectedDoctor.id); setShowModal(false); }}
                                            className="flex-1 bg-red-500 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                                        >
                                            Suspend Doctor
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { handleApprove(selectedDoctor.id); setShowModal(false); }}
                                            className="flex-1 bg-[#2ECC71] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-[#2ECC71]/20 hover:scale-[1.02] transition-all"
                                        >
                                            Approve Practitioner
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative p-12"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Invite Practitioner</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                    <input type="text" placeholder="Dr. John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-[1rem] p-4 font-bold text-slate-700 focus:outline-none focus:border-[#7C3AED]" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                    <input type="email" placeholder="john.doe@hospital.com" className="w-full bg-slate-50 border border-slate-200 rounded-[1rem] p-4 font-bold text-slate-700 focus:outline-none focus:border-[#7C3AED]" />
                                </div>
                                <button 
                                    onClick={() => { alert("Invite sent successfully!"); setShowInviteModal(false); }}
                                    className="w-full bg-[#7C3AED] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all mt-4"
                                >
                                    Send secure Link
                                </button>
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative p-12"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Filter Directory</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Status</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['all', 'APPROVED', 'PENDING'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => setFilterOptions({...filterOptions, status: s})}
                                                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterOptions.status === s ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Experience Range</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['all', '0-5', '10+'].map(e => (
                                            <button 
                                                key={e}
                                                onClick={() => setFilterOptions({...filterOptions, experience: e})}
                                                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterOptions.experience === e ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                            >
                                                {e === 'all' ? 'Any' : `${e} years`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowFilterModal(false)}
                                    className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all mt-8"
                                >
                                    Apply Configuration
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
