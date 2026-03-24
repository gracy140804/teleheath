"use client";

import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    UserCircle, 
    LogOut, 
    LayoutDashboard, 
    Clock, 
    Save, 
    Edit, 
    CheckCircle2,
    Activity,
    Award,
    IndianRupee,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function DoctorProfile() {
    const pathname = usePathname();
    const router = useRouter();

    const [profile, setProfile] = useState({
        name: '',
        specialization: '',
        qualification: '',
        experience: 0,
        consultation_fee: 0,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/doctor/profile');
                if (res.data) {
                    setProfile({
                        name: res.data.name || '',
                        specialization: res.data.specialization || '',
                        qualification: res.data.qualification || '',
                        experience: res.data.experience || 0,
                        consultation_fee: res.data.consultation_fee || 0,
                    });
                }
            } catch (err) {
                console.error("Failed to load doctor profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name === 'experience' || name === 'consultation_fee' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                specialization: profile.specialization,
                qualification: profile.qualification,
                experience: profile.experience,
                consultation_fee: profile.consultation_fee,
            };
            await api.put('/doctor/profile', payload);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Failed to save profile:", err);
            setMessage('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
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
                            <p className="text-sm font-black text-[#2D3436] leading-none tracking-tight">{profile.name || "Loading..."}</p>
                            <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.1em] mt-2">{profile.specialization || "Doctor"}</p>
                        </div>
                        <div className="w-11 h-11 bg-[#2563EB]/10 rounded-full flex items-center justify-center text-[#2563EB] font-black text-sm border border-[#2563EB]/20 overflow-hidden shadow-sm">
                            {(profile.name || "D")[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-5xl mx-auto w-full space-y-12 pb-24">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-[#2D3436] mb-2 uppercase tracking-tight">Professional Profile</h2>
                            <p className="text-[#636E72] text-base font-medium">Update your professional information and settings.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#2563EB] text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#2563EB]/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className={`p-6 rounded-[1.5rem] flex items-center gap-4 font-black text-sm border shadow-lg ${message.includes('success') ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] shadow-[#2ECC71]/10' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2] shadow-red-100'}`}
                            >
                                <CheckCircle2 className="w-6 h-6" />
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div className="space-y-8">
                            <div className="h-[400px] bg-[#FDFBF7] border border-[#E8E4D9] rounded-[3rem] animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] border border-[#E8E4D9] shadow-sm overflow-hidden">
                            <div className="p-10 border-b border-[#E8E4D9]/50 bg-[#FDFBF7]/30 flex items-center gap-4">
                                <div className="p-3 bg-[#2563EB]/10 rounded-2xl">
                                    <Edit className="w-6 h-6 text-[#2563EB]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#2D3436] tracking-tight">Public Information</h3>
                                    <p className="text-[#636E72] text-xs font-bold mt-1">This information will be displayed to patients booking appointments.</p>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1 flex items-center gap-2">
                                            <UserCircle className="w-3.5 h-3.5" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            disabled
                                            className="w-full px-6 py-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.5rem] text-sm font-bold text-[#636E72]/60 cursor-not-allowed"
                                        />
                                        <p className="text-[10px] text-[#636E72]/40 ml-1 italic font-bold">Name can only be changed by system administrator.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1 flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" /> Specialization
                                        </label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={profile.specialization}
                                            onChange={handleChange}
                                            placeholder="e.g., Cardiologist, Dermatologist"
                                            className="w-full px-6 py-4 bg-white border border-[#E8E4D9] rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Award className="w-3.5 h-3.5" /> Educational Qualifications
                                    </label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={profile.qualification}
                                        onChange={handleChange}
                                        placeholder="e.g., MBBS, MD - Cardiology"
                                        className="w-full px-6 py-4 bg-white border border-[#E8E4D9] rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5" /> Years of Experience
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="experience"
                                                value={profile.experience}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-6 py-4 bg-white border border-[#E8E4D9] rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#636E72] uppercase">Years</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#636E72] uppercase tracking-wider ml-1 flex items-center gap-2">
                                            <IndianRupee className="w-3.5 h-3.5" /> Consultation Fee
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="consultation_fee"
                                                value={profile.consultation_fee}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                className="w-full px-6 py-4 bg-white border border-[#E8E4D9] rounded-[1.5rem] text-sm font-bold pl-12 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all text-[#2D3436]"
                                            />
                                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636E72]" />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#636E72] uppercase">INR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
