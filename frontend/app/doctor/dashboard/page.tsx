'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Mic,
    Calendar,
    History,
    FileText,
    LogOut,
    LayoutDashboard,
    Stethoscope,
    ClipboardList,
    Bell,
    Search,
    ChevronRight,
    User,
    Plus,
    PlusCircle,
    CheckCircle2,
    Clock,
    UserCircle,
    ArrowRight,
    MessageSquare,
    Check,
    X,
    RotateCcw,
    Settings,
    Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';

import NotificationBell from '@/components/NotificationBell';

export default function DoctorDashboard() {
    const [statsData, setStatsData] = useState({ today_appointments: 0, pending_requests: 0, total_patients: 0 });
    const [appointments, setAppointments] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'TODAY', 'PENDING'
    const pathname = usePathname();
    const router = useRouter();

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, apptsRes, profileRes] = await Promise.all([
                api.get('/doctor/stats'),
                api.get('/doctor/appointments'),
                api.get('/doctor/profile')
            ]);
            setStatsData(statsRes.data);
            setAppointments(apptsRes.data);
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Failed to fetch doctor dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAccept = async (id: number) => {
        try {
            await api.post(`/doctor/appointment/${id}/accept`);
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to accept appointment:", err);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.post(`/doctor/appointment/${id}/reject`);
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to reject appointment:", err);
        }
    };

    const handleReschedule = async (id: number) => {
        const newTime = prompt("Enter new suggested datetime (YYYY-MM-DDTHH:MM):", new Date().toISOString().slice(0, 16));
        if (!newTime) return;
        try {
            await api.post(`/doctor/appointment/${id}/reschedule?new_datetime=${newTime}`);
            fetchDashboardData();
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

    const stats = [
        { label: "Today's Appointments", value: statsData.today_appointments, sub: "Scheduled", icon: <Calendar className="w-6 h-6 text-[#2563EB]" />, bg: "bg-[#2563EB]/10", type: 'TODAY' },
        { label: "Pending Requests", value: statsData.pending_requests, sub: "Requires Review", icon: <Clock className="w-6 h-6 text-[#E17055]" />, bg: "bg-[#E17055]/10", type: 'PENDING' },
        { label: "Total Patients", value: statsData.total_patients, sub: "Lifetime", icon: <UserCircle className="w-6 h-6 text-[#60A5FA]" />, bg: "bg-[#60A5FA]/10", type: 'ALL' },
    ];

    const filteredAppointments = appointments.filter(apt => {
        if (filterType === 'ALL') return true;
        if (filterType === 'PENDING') return apt.status === 'PENDING';
        if (filterType === 'TODAY') {
            const aptDate = new Date(apt.appointment_datetime).toLocaleDateString();
            const todayDate = new Date().toLocaleDateString();
            return aptDate === todayDate;
        }
        return true;
    });

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

                        <div className="flex items-center gap-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] px-6 py-2.5 w-full max-w-sm focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                            <Search className="w-4 h-4 text-[#636E72]" />
                            <input className="bg-transparent border-none outline-none text-sm font-bold w-full text-[#2D3436] placeholder-[#636E72]/50" placeholder="Search patients..." />
                        </div>
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
                    {/* Header Section */}
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-2">Doctor Dashboard</h2>
                        <p className="text-[#636E72] text-base font-medium">Manage your schedule and patient clinical records.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setFilterType(stat.type)}
                                className={`bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col gap-6 cursor-pointer transition-all group ${
                                    filterType === stat.type 
                                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/10 shadow-lg bg-[#FDFBF7]' 
                                    : 'border-[#E8E4D9] hover:shadow-xl hover:border-[#2563EB]/30'
                                }`}
                            >
                                <div className={`${stat.bg} w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#636E72]/60 mb-2">{stat.label}</p>
                                    <p className="text-3xl font-black text-[#2D3436] tracking-tight">{stat.value}</p>
                                    <p className="text-xs font-bold text-[#2563EB] mt-2">{stat.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Appointments Section */}
                    <div className="bg-white rounded-[2.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-[#E8E4D9]/50 flex items-center justify-between bg-[#FDFBF7]/30">
                            <h3 className="text-lg font-black text-[#2D3436] flex items-center gap-3 tracking-tight">
                                <Calendar className="w-6 h-6 text-[#2563EB]" />
                                <span>Upcoming Appointments</span>
                            </h3>
                            <button className="bg-[#2563EB]/10 text-[#2563EB] px-5 py-2 rounded-full text-xs font-black hover:bg-[#2563EB] hover:text-white transition-all">View Schedule</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#FDFBF7]">
                                    <tr>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Patient</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Date & Time</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Status</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-[#636E72] uppercase tracking-[0.1em] border-b border-[#E8E4D9]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E4D9]/50">
                                    {loading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-10 py-8"><div className="h-4 bg-[#FDFBF7] rounded-full w-full"></div></td>
                                            </tr>
                                        ))
                                    ) : (filteredAppointments || []).map((apt: any) => {
                                        const apptDate = new Date(apt.appointment_datetime);
                                        return (
                                            <tr key={apt.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
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
                                                        apt.status === 'RESCHEDULE_REQUESTED' ? 'bg-blue-50 text-[#2563EB] border-blue-100' :
                                                        'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
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
                                                        {(apt.status === 'CONFIRMED' || apt.status === 'COMPLETED') && (
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.createElement('input');
                                                                    input.type = 'file';
                                                                    input.accept = 'application/pdf,image/*';
                                                                    input.onchange = async (e: any) => {
                                                                        const file = e.target.files[0];
                                                                        if (!file) return;
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        try {
                                                                            await api.post(`/doctor/appointment/${apt.id}/upload-prescription`, formData);
                                                                            alert("Prescription uploaded and session finalized!");
                                                                            fetchDashboardData();
                                                                        } catch (err: any) {
                                                                            const detail = err.response?.data?.detail;
                                                                            const msg = typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : err.message || "Unknown error");
                                                                            alert("Upload failed: " + msg);
                                                                        }
                                                                    };
                                                                    input.click();
                                                                }}
                                                                className="bg-emerald-500 text-white h-10 px-5 rounded-[1rem] text-[11px] font-black flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                {apt.status === 'COMPLETED' ? 'Update Prescription' : 'Prescribe & Close'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleReject(apt.id)}
                                                            className="p-2.5 text-[#636E72] hover:text-[#E17055] hover:bg-[#E17055]/10 rounded-full transition-all group"
                                                            title="Reject/Archive Appointment"
                                                        >
                                                            <X className="w-5 h-5 group-hover:scale-110" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {(!loading && (!filteredAppointments || filteredAppointments.length === 0)) && (
                                <div className="p-20 text-center bg-[#FDFBF7]/10">
                                    <p className="text-[#636E72] text-sm font-bold italic">
                                        {filterType === 'ALL' ? 'No upcoming appointments found.' : `No ${filterType.toLowerCase()} appointments found.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
