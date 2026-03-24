"use client";

import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    UserCircle, 
    LogOut, 
    LayoutDashboard, 
    Clock, 
    Plus, 
    Trash2, 
    CheckCircle2,
    Activity,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function DoctorAvailability() {
    const pathname = usePathname();
    const router = useRouter();

    const [slots, setSlots] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newStartTime, setNewStartTime] = useState('09:00');
    const [newEndTime, setNewEndTime] = useState('17:00');
    const [newDuration, setNewDuration] = useState(30);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const [res, profileRes] = await Promise.all([
                api.get('/doctor/availability'),
                api.get('/doctor/profile')
            ]);
            setSlots(res.data);
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Failed to load availability slots:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const payload = {
                date: newDate,
                start_time: newStartTime,
                end_time: newEndTime,
                slot_duration: newDuration
            };
            await api.post('/doctor/availability', payload);
            setMessage('Slot added successfully!');
            fetchSlots();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Failed to add slot:", err);
            setMessage('Failed to add slot. Please try again.');
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!confirm('Are you sure you want to remove this availability slot?')) return;
        try {
            await api.delete(`/doctor/availability/${id}`);
            fetchSlots();
        } catch (err) {
            console.error("Failed to delete slot:", err);
            setMessage('Failed to remove slot.');
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
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen overflow-x-hidden">
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

                <div className="p-10 max-w-6xl mx-auto w-full space-y-12 pb-24">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">Manage Availability</h2>
                        <p className="text-[#636E72] text-base font-medium">Set your working hours and available consultation slots.</p>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className={`p-6 rounded-[1.5rem] flex items-center gap-4 font-black text-sm border shadow-lg ${message.includes('success') ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] shadow-[#2ECC71]/10' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2] shadow-red-100'}`}
                            >
                                {message.includes('success') ? <CheckCircle2 className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Add New Slot Form */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-[2.5rem] border border-[#E8E4D9] shadow-sm overflow-hidden sticky top-32">
                                <div className="p-8 border-b border-[#E8E4D9]/50 bg-[#FDFBF7]/30 flex items-center gap-3">
                                    <div className="p-2 bg-[#2563EB]/10 rounded-xl">
                                        <Plus className="w-5 h-5 text-[#2563EB]" />
                                    </div>
                                    <h3 className="font-black text-[#2D3436] tracking-tight">Add New Slot</h3>
                                </div>
                                <form onSubmit={handleAddSlot} className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1">Select Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            className="w-full px-5 py-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1">Start</label>
                                            <input
                                                type="time"
                                                required
                                                value={newStartTime}
                                                onChange={(e) => setNewStartTime(e.target.value)}
                                                className="w-full px-5 py-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1">End</label>
                                            <input
                                                type="time"
                                                required
                                                value={newEndTime}
                                                onChange={(e) => setNewEndTime(e.target.value)}
                                                className="w-full px-5 py-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1">Slot Duration</label>
                                        <div className="relative">
                                            <select
                                                value={newDuration}
                                                onChange={(e) => setNewDuration(Number(e.target.value))}
                                                className="w-full px-5 py-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] text-sm font-bold focus:outline-none appearance-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                            >
                                                <option value={15}>15 Minutes</option>
                                                <option value={30}>30 Minutes</option>
                                                <option value={45}>45 Minutes</option>
                                                <option value={60}>60 Minutes</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronRight className="w-4 h-4 text-[#636E72] rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-[#2563EB] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#2563EB]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                        Save Availability
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Existing Slots List */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[3rem] border border-[#E8E4D9] shadow-sm overflow-hidden min-h-[500px]">
                                <div className="p-10 border-b border-[#E8E4D9]/50 bg-[#FDFBF7]/30 flex items-center justify-between">
                                    <h3 className="font-black text-[#2D3436] flex items-center gap-3 tracking-tight text-xl">
                                        <div className="p-2 bg-[#2563EB]/10 rounded-xl">
                                            <Clock className="w-6 h-6 text-[#2563EB]" />
                                        </div>
                                        Current Schedule
                                    </h3>
                                    <div className="bg-[#2ECC71]/10 text-[#2ECC71] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {slots.length} Active Slots
                                    </div>
                                </div>
                                <div className="p-10">
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#FDFBF7] rounded-[2rem] animate-pulse"></div>)}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="text-center py-24 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-6">
                                                <Clock className="w-10 h-10 text-[#CED6E0]" />
                                            </div>
                                            <p className="text-[#636E72] text-lg font-bold">No availability slots defined yet.</p>
                                            <p className="text-[#636E72]/60 text-sm mt-1">Use the form on the left to add your first slot.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {slots.map((slot) => {
                                                const dateObj = new Date(slot.date);
                                                return (
                                                    <div key={slot.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-[#E8E4D9]/60 hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 transition-all duration-300 group">
                                                        <div className="flex items-center gap-6">
                                                            <div className="bg-white text-[#2563EB] w-[4.5rem] h-[4.5rem] rounded-[1.5rem] border border-[#E8E4D9] flex flex-col items-center justify-center shadow-sm group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
                                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                                <span className="text-2xl font-black">{dateObj.getDate()}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-black text-[#2D3436] tracking-tight">
                                                                    {slot.start_time} - {slot.end_time}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FDFBF7] border border-[#E8E4D9]/50 rounded-full">
                                                                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                                                                        <span className="text-[11px] font-bold text-[#636E72]">{slot.slot_duration} min sessions</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FDFBF7] border border-[#E8E4D9]/50 rounded-full">
                                                                        <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                                                                        <span className="text-[11px] font-bold text-[#636E72]">{dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="w-12 h-12 flex items-center justify-center text-[#636E72] hover:text-[#E17055] hover:bg-[#E17055]/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:rotate-12"
                                                            title="Remove slot"
                                                        >
                                                            <Trash2 className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
