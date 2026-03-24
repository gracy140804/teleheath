'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, X, User, Bell, LogOut, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        setIsLoggedIn(!!token);

        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => {
                window.removeEventListener('scroll', handleScroll);
                clearInterval(interval);
            };
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
    };

    const navLinks: any[] = [];

    // Prevent Navbar from rendering on dashboard/auth pages to avoid overlapping clicks
    const hideOnPaths = ['/', '/login', '/register', '/forgot-password', '/dashboard', '/symptoms', '/doctors', '/appointments', '/prescriptions', '/profile', '/admin', '/book-appointment'];
    if (hideOnPaths.some(p => pathname === p || pathname?.startsWith(p + '/'))) {
        return null;
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-[#2563EB] p-2.5 rounded-2xl shadow-lg shadow-[#2563EB]/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]">
                            AuraHealth
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-bold transition-colors hover:text-[#2563EB] ${pathname === link.href ? 'text-[#2563EB] underline underline-offset-8 decoration-2' : 'text-[#636E72]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2.5 rounded-full hover:bg-[#2563EB]/10 transition-colors relative group"
                                    >
                                        <Bell className="w-5 h-5 text-[#636E72] group-hover:text-[#2563EB]" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E17055] rounded-full border-2 border-white animate-pulse"></span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                            >
                                                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button 
                                                            onClick={markAllAsRead}
                                                            className="text-xs font-bold text-[#2563EB] hover:underline"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center text-slate-400 text-sm">
                                                            No new notifications
                                                        </div>
                                                    ) : (
                                                        notifications.map((n) => (
                                                            <div 
                                                                key={n.id} 
                                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1 mr-2">
                                                                        <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                                                        <span className="text-[10px] text-slate-400 mt-2 block">
                                                                            {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                        </span>
                                                                    </div>
                                                                    {!n.is_read && (
                                                                        <button 
                                                                            onClick={() => markAsRead(n.id)}
                                                                            className="p-1 rounded-full hover:bg-blue-100 text-[#2563EB]"
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {n.link && (
                                                                    <Link 
                                                                        href={n.link}
                                                                        onClick={() => setShowNotifications(false)}
                                                                        className="text-[10px] font-bold text-[#2563EB] mt-2 block hover:underline"
                                                                    >
                                                                        View Details →
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <Link href="/patient/dashboard" className="p-2.5 rounded-full hover:bg-[#2563EB]/10 transition-colors group">
                                    <User className="w-5 h-5 text-[#636E72] group-hover:text-[#2563EB]" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1.5 text-sm font-bold text-[#E17055] hover:text-[#d63031] transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-6">
                                <Link href="/login" className="text-sm font-bold text-[#636E72] hover:text-[#2563EB]">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-4 text-base font-medium text-slate-700 hover:text-sky-500 hover:bg-slate-50 rounded-lg flex justify-between items-center"
                                >
                                    {link.name}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ))}
                            {!isLoggedIn ? (
                                <div className="grid grid-cols-2 gap-4 mt-6 px-3">
                                    <Link href="/login" className="btn-secondary text-center">Login</Link>
                                    <Link href="/register" className="btn-primary text-center">Sign Up</Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-2 text-red-500 px-3 py-4 font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
