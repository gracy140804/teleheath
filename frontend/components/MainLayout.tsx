'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Mic,
    Calendar,
    FileText,
    LogOut,
    LayoutDashboard,
    Bell,
    UserCircle,
    UserPlus,
    CheckCircle2,
    AlertCircle,
    Stethoscope,
    Clock,
    X,
    Video
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/components/LanguageContext';
import NotificationBell from '@/components/NotificationBell';

export default function MainLayout({ children, title = "" }: { children: React.ReactNode, title?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const { lang, setLang, t } = useLanguage();

    const toggleLang = () => {
        setLang(lang === 'en' ? 'ta' : 'en');
    };

    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                setUserProfile(res.data);
            })
            .catch(err => {
                console.error("Failed to fetch profile", err);
                if (err.response?.status === 401) {
                    handleLogout();
                }
            });
    }, []);

    const sidebarItems = React.useMemo(() => {
        if (!userProfile) return [];

        if (userProfile.role === 'ADMIN') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
                { name: 'Manage Doctors', icon: Stethoscope, href: '/admin/doctors' },
                { name: 'Manage Patients', icon: UserCircle, href: '/admin/patients' }, 
                { name: 'Appointments', icon: Calendar, href: '/admin/appointments' },
                { name: 'Analytics', icon: Activity, href: '/admin/analytics' }, 
                { name: 'Settings', icon: Bell, href: '/admin/settings' }, 
            ];
        }

        if (userProfile.role === 'DOCTOR') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, href: '/doctor/dashboard' },
                { name: 'Appointments', icon: Calendar, href: '/doctor/appointments' },
                { name: 'Availability', icon: Clock, href: '/doctor/availability' },
                { name: 'Patient Directory', icon: UserCircle, href: '/doctor/patients' },
                { name: 'New Prescription', icon: FileText, href: '/doctor/prescriptions/new' },
                { name: 'Profile', icon: UserCircle, href: '/doctor/profile' },
            ];
        }

        return [
            { name: t.dashboard || 'Dashboard', icon: LayoutDashboard, href: '/patient/dashboard' },
            { name: t.recordSymptoms || 'Submit Symptoms', icon: Mic, href: '/symptoms' },
            { name: t.bookAppointment || 'Book Appointment', icon: UserPlus, href: '/doctors' },
            { name: t.recentAppointments || 'My Appointments', icon: Calendar, href: '/appointments' },
            { name: t.prescriptions || 'Prescriptions', icon: FileText, href: '/prescriptions' },
            { name: t.profile || 'Profile', icon: UserCircle, href: '/profile' },
        ];
    }, [userProfile, t]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        router.push('/login');
    };

    return (
        <div className={`min-h-screen bg-[#FDFBF7] flex antialiased ${lang === 'ta' ? 'font-tamil' : 'font-outfit'}`}>
            <aside className="w-[240px] bg-white border-r border-[#E8E4D9] flex flex-col fixed h-full z-20 shadow-sm">
                <div className="p-6 pb-8 flex items-center gap-2">
                    <div className="bg-[#2563EB] p-2 rounded-2xl shadow-lg shadow-[#2563EB]/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-[#2D3436] tracking-tight">AuraHealth</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[1.5rem] font-bold text-sm text-[#E17055] hover:bg-[#E17055]/10 transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-[240px] flex flex-col min-h-screen bg-[#FDFBF7]">
                <header className="h-16 bg-white border-b border-[#E8E4D9] px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <h1 className="text-xl font-black text-[#2D3436] tracking-tight">{title}</h1>
                    <div className="flex items-center gap-6 relative">
                        <button
                            onClick={toggleLang}
                            className="bg-[#FDFBF7] px-4 py-2 rounded-[1rem] text-[10px] font-black text-[#636E72] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-all border border-[#E8E4D9]"
                        >
                            {lang === 'en' ? 'தமிழ்' : 'English'}
                        </button>

                        <NotificationBell />

                        <div className="flex items-center gap-4 pl-6 border-l border-[#E8E4D9]">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-[#2D3436] leading-none tracking-tight">{userProfile?.name || 'Loading...'}</p>
                                <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.1em] mt-2">
                                    {userProfile?.role || 'User'}
                                </p>
                            </div>
                            <div className="w-11 h-11 bg-[#2563EB]/10 rounded-full flex items-center justify-center text-[#2563EB] font-black text-sm overflow-hidden border border-[#2563EB]/20">
                                {userProfile?.avatar_url ? (
                                    <img
                                        src={`${(api.defaults.baseURL || '').replace('/api', '').replace(/\/$/, '')}${userProfile.avatar_url}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 w-full animate-fade-in max-w-7xl mx-auto flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
