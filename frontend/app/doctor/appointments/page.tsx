"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    UserCircle, 
    LogOut, 
    LayoutDashboard, 
    Clock, 
    Video, 
    X,
    Activity,
    Search,
    FileText,
    History,
    MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

export default function DoctorAppointments() {
    const pathname = usePathname();
    const router = useRouter();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedApt, setSelectedApt] = useState<any>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const [res, profileRes] = await Promise.all([
                api.get('/doctor/appointments'),
                api.get('/doctor/profile')
            ]);
            setAppointments(res.data);
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAccept = async (id: number) => {
        try {
            await api.post(`/doctor/appointment/${id}/accept`);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to accept appointment:", err);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject this appointment?')) return;
        try {
            await api.post(`/doctor/appointment/${id}/reject`);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to reject appointment:", err);
        }
    };

    const handleReschedule = async (id: number) => {
        const newTime = prompt("Enter new suggested datetime (YYYY-MM-DDTHH:MM):", new Date().toISOString().slice(0, 16));
        if (!newTime) return;
        try {
            await api.post(`/doctor/appointment/${id}/reschedule?new_datetime=${newTime}`);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to reschedule appointment:", err);
            alert("Invalid datetime format. Use YYYY-MM-DDTHH:MM");
        }
    };

    const sidebarItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/doctor/dashboard' },
        { name: 'Appointments', icon: Calendar, href: '/doctor/appointments' },
        { name: 'Availability', icon: Clock, href: '/doctor/availability' },
        { name: 'Profile', icon: UserCircle, href: '/doctor/profile' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex font-outfit antialiased text-[#2D3436]">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-[280px] bg-white border-r border-[#E8E4D9] flex flex-col fixed h-full z-20 shadow-sm">
                <div className="p-10 flex items-center gap-3">
                    <div className="bg-[#2563EB] p-2.5 rounded-2xl shadow-lg shadow-[#2563EB]/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-[#2D3436] tracking-tight">AuraHealth</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20' 
                                    : 'text-[#636E72] hover:bg-[#2563EB]/10 hover:text-[#2563EB]'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-[#E8E4D9]/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-[1.5rem] font-bold text-sm text-[#E17055] hover:bg-[#E17055]/10 transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen bg-[#FDFBF7]">
                {/* Top Nav */}
                <header className="h-20 bg-white border-b border-[#E8E4D9] px-10 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-6 relative">
                        <NotificationBell />
                        <div className="flex-1"></div>
                    </div>
                    <div className="flex items-center gap-6 pl-8 border-l border-[#E8E4D9]">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-[#2D3436] leading-none tracking-tight">{profile?.name || 'Loading...'}</p>
                            <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.1em] mt-2">{profile?.specialization || 'Doctor'}</p>
                        </div>
                        <div className="w-11 h-11 bg-[#2563EB]/10 rounded-full flex items-center justify-center text-[#2563EB] font-black text-sm border border-[#2563EB]/20 overflow-hidden shadow-sm">
                            {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'DR'}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full space-y-12 pb-24">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-2">All Appointments</h2>
                        <p className="text-[#636E72] text-base font-medium">View and manage your full appointment history.</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-[#E8E4D9]/50 flex items-center justify-between bg-[#FDFBF7]/30">
                            <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tight">
                                <Calendar className="w-6 h-6 text-[#2563EB]" />
                                <span>Appointment Directory</span>
                            </h3>
                            <div className="bg-[#2ECC71]/10 text-[#2ECC71] px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                                {appointments.length} Total
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#FDFBF7]">
                                    <tr>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Patient</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Date & Time</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Status</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Payment</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E4D9]/50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-10 py-8"><div className="h-4 bg-[#FDFBF7] rounded-full w-full"></div></td>
                                            </tr>
                                        ))
                                    ) : (appointments || []).map((apt: any) => {
                                        const apptDate = new Date(apt.appointment_datetime);
                                        return (
                                            <tr key={apt.id} className="hover:bg-[#FDFBF7]/50 transition-colors relative">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-black text-xs shadow-sm shadow-[#2563EB]/10 uppercase">
                                                            {apt.patient_name?.[0] || 'P'}
                                                        </div>
                                                        <span className="font-black text-sm text-[#2D3436] tracking-tight">{apt.patient_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-[#2D3436] tracking-tight">
                                                            {apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs font-bold text-[#636E72] mt-1">
                                                            {apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-sm ${
                                                        apt.status === 'CONFIRMED' ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' :
                                                        apt.status === 'PENDING' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7]' :
                                                        apt.status === 'COMPLETED' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                        apt.status === 'RESCHEDULE_REQUESTED' ? 'bg-blue-50 text-[#2563EB] border-blue-100' :
                                                        'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`text-[11px] font-black tracking-tight ${apt.payment_status === 'PAID' ? 'text-[#2ECC71]' : 'text-[#E17055]'}`}>
                                                        {apt.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {apt.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAccept(apt.id)}
                                                                    className="bg-[#2ECC71] text-white h-10 px-5 rounded-[1rem] text-[11px] font-black shadow-lg shadow-[#2ECC71]/20 hover:scale-105 active:scale-95 transition-all"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReschedule(apt.id)}
                                                                    className="bg-[#FDFBF7] text-[#636E72] border border-[#E8E4D9] h-10 px-5 rounded-[1rem] text-[11px] font-black hover:bg-white transition-all shadow-sm"
                                                                >
                                                                    Reschedule
                                                                </button>
                                                            </>
                                                        )}
                                                        {apt.status === 'CONFIRMED' && (
                                                            <button
                                                                onClick={() => router.push(`/doctor/video-call/${apt.id}?roomId=${apt.video_room_id}`)}
                                                                className="bg-[#2563EB] text-white h-10 px-5 rounded-[1rem] text-[11px] font-black flex items-center gap-2 hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/20 transition-all active:scale-95"
                                                            >
                                                                <Video className="w-4 h-4" />
                                                                Join Call
                                                            </button>
                                                        )}
                                                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                                            <button
                                                                onClick={() => handleReject(apt.id)}
                                                                className="p-2.5 text-[#636E72] hover:text-[#E17055] hover:bg-[#E17055]/10 rounded-full transition-all group"
                                                                title="Reject Appointment"
                                                            >
                                                                <X className="w-5 h-5 group-hover:scale-110" />
                                                            </button>
                                                        )}
                                                        {apt.status === 'COMPLETED' && (
                                                            <button 
                                                                onClick={() => setSelectedApt(apt)}
                                                                className="flex items-center gap-2 bg-slate-100 text-[#2D3436] h-10 px-5 rounded-[1rem] text-[11px] font-black hover:bg-slate-200 transition-all border border-slate-200"
                                                            >
                                                                <FileText className="w-4 h-4 text-[#2563EB]" />
                                                                Notes
                                                            </button>
                                                        )}
                                                        {apt.status === 'REJECTED' && (
                                                            <button 
                                                                onClick={() => alert("Appointment was rejected due to scheduling conflict.")}
                                                                className="p-2.5 text-[#636E72] hover:text-[#2D3436] hover:bg-slate-100 rounded-full transition-all group"
                                                                title="View Details"
                                                            >
                                                                <History className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {(!loading && (!appointments || appointments.length === 0)) && (
                                <div className="p-20 text-center bg-[#FDFBF7]/10">
                                    <p className="text-[#636E72] text-sm font-bold italic">You have no appointments in your history.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setSelectedApt(null)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-[#636E72]" />
                            </button>

                            <div className="p-12">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="p-4 bg-[#2563EB]/10 rounded-2xl">
                                        <FileText className="w-10 h-10 text-[#2563EB]" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Consultation Summary</h3>
                                        <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.2em] opacity-60">Record ID: #APT-{selectedApt.id}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Patient</span>
                                            <span className="text-sm font-black text-slate-900">{selectedApt.patient_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">Date Conducted</span>
                                            <span className="text-sm font-black text-slate-900">
                                                {new Date(selectedApt.appointment_datetime).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-8 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Activity className="w-4 h-4 text-[#2563EB]" />
                                            <span className="text-[10px] font-black text-[#636E72] uppercase tracking-widest">Clinical Notes</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                            "Patient showed positive response to initial treatment plan. Recommended follow-up in 2 weeks for metric verification."
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        {selectedApt.has_prescription && (
                                            <a 
                                                href={`${(api.defaults.baseURL || '').replace('/api', '').replace(/\/$/, '')}${selectedApt.prescription_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-emerald-500 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                View Existing Rx
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => {
                                                router.push(`/doctor/prescriptions/new?appointmentId=${selectedApt.id}&patientId=${selectedApt.patient_id}`);
                                                setSelectedApt(null);
                                            }}
                                            className="flex-1 bg-[#2563EB] text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-[#2563EB]/20 hover:scale-[1.02] transition-all"
                                        >
                                            {selectedApt.has_prescription ? "Issue New Rx" : "Issue Prescription"}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedApt(null)}
                                        className="w-full bg-slate-100 text-[#2D3436] py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.1em] hover:bg-slate-200 transition-all border border-slate-200"
                                    >
                                        Close Summary
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
