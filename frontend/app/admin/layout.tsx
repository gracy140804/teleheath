'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
    Activity,
    Users,
    Stethoscope,
    Calendar,
    BarChart3,
    LogOut,
    LayoutDashboard,
    TrendingUp,
    Settings,
    Search
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = React.useState<any>(null);

    const sidebarItems = React.useMemo(() => {
        if (userProfile?.role === 'DOCTOR') {
            return [
                { name: 'Patient Directory', icon: Users, href: '/admin/patients' },
                { name: 'Doctor Dashboard', icon: LayoutDashboard, href: '/doctor/dashboard' },
            ];
        }
        return [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
            { name: 'Manage Doctors', icon: Stethoscope, href: '/admin/doctors' },
            { name: 'Manage Patients', icon: Users, href: '/admin/patients' },
            { name: 'Appointments', icon: Calendar, href: '/admin/appointments' },
            { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
            { name: 'Settings', icon: Settings, href: '/admin/settings' },
        ];
    }, [userProfile]);

    React.useEffect(() => {
        api.get('/auth/me')
            .then(res => setUserProfile(res.data))
            .catch(err => {
                console.error("Failed to fetch admin/doctor profile", err);
            });
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex font-outfit antialiased text-[#2D3436]">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-[280px] bg-white border-r border-[#E8E4D9] flex flex-col fixed h-full z-20 shadow-sm transition-all duration-300">
                <div className="p-10 flex items-center gap-3">
                    <div className="bg-[#7C3AED] p-2.5 rounded-2xl shadow-lg shadow-[#7C3AED]/20">
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
                                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20' 
                                    : 'text-[#636E72] hover:bg-[#7C3AED]/10 hover:text-[#7C3AED]'
                                }`}
                            >
                                <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-[#E8E4D9]/50 space-y-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-[1.5rem] font-bold text-sm text-[#E17055] hover:bg-[#E17055]/10 transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                        <span>Logout</span>
                    </button>

                    <div className="bg-[#7C3AED]/5 p-6 rounded-[2rem] border border-[#7C3AED]/10 items-center text-center">
                        <TrendingUp className="w-6 h-6 text-[#7C3AED] mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase text-[#636E72] tracking-widest mb-1 opacity-60">System Growth</p>
                        <p className="text-xl font-black text-[#7C3AED]">+12%</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 bg-white border-b border-[#E8E4D9] flex items-center justify-between px-10 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4 bg-[#FDFBF7] border border-[#E8E4D9] rounded-[1.2rem] px-6 py-2.5 w-full max-w-sm focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10 transition-all duration-300">
                        <Search className="w-4 h-4 text-[#636E72]" />
                        <input className="bg-transparent border-none outline-none text-sm font-bold w-full text-[#2D3436] placeholder-[#636E72]/50" placeholder="Search resources..." />
                    </div>

                    <div className="flex items-center gap-8 pl-8 ml-auto">
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                        </div>
                        <div className="border-l border-[#E8E4D9] pl-8 flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-[#2D3436] leading-none tracking-tight mb-1">{userProfile?.name || 'Loading...'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] opacity-80">{userProfile?.role || 'User'}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#7C3AED] rounded-[1rem] flex items-center justify-center text-white font-black shadow-lg shadow-[#7C3AED]/20 border border-[#7C3AED]/20">
                                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full transition-all duration-500 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
