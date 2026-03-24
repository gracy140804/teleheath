'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NotificationBell() {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifUnread, setNotifUnread] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
            setNotifUnread(res.data.filter((n: any) => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setNotifUnread(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setNotifUnread(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => { setShowNotifications(!showNotifications); }}
                className="relative p-2.5 rounded-full text-[#636E72] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors"
            >
                <Bell className="w-5 h-5" />
                {notifUnread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E17055] rounded-full border-2 border-white" />
                )}
            </button>

            <AnimatePresence>
                {showNotifications && (
                    <>
                        {/* Backdrop to close dropdown */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            className="absolute top-full mt-3 right-0 w-80 bg-white border border-[#E8E4D9] shadow-2xl rounded-[2rem] p-5 z-50 origin-top-right overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-black text-sm text-[#2D3436] tracking-tight">Notifications</h4>
                                <div className="flex items-center gap-3">
                                    {notifUnread > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-bold text-[#2563EB] hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)} className="text-[#636E72] hover:text-[#2D3436] transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-[#636E72] text-center py-4">No notifications yet.</p>
                                ) : notifications.map((n) => (
                                    <button 
                                        key={n.id} 
                                        onClick={() => {
                                            markAsRead(n.id);
                                            if (n.link) {
                                                router.push(n.link);
                                                setShowNotifications(false);
                                            }
                                        }}
                                        className={`w-full text-left p-3 hover:bg-[#FDFBF7] rounded-[1.2rem] border transition-colors flex items-start gap-3 relative ${!n.is_read ? 'bg-blue-50/30 border-[#2563EB]/20 shadow-sm' : 'border-[#E8E4D9]/50'}`}
                                    >
                                        {!n.is_read && (
                                            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                                        )}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                            n.type === 'STATUS_CHANGE' ? 'bg-blue-50' :
                                            n.type === 'CONSULTATION_START' ? 'bg-green-50' : 'bg-slate-50'
                                        }`}>
                                            {n.type === 'STATUS_CHANGE' && <Calendar className="w-4 h-4 text-[#2563EB]" />}
                                            {n.type === 'CONSULTATION_START' && <Video className="w-4 h-4 text-green-600" />}
                                            {n.type === 'GENERAL' && <Bell className="w-4 h-4 text-slate-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs ${!n.is_read ? 'font-black' : 'font-bold'} text-[#2D3436]`}>{n.title}</p>
                                            <p className="text-[11px] font-medium text-[#636E72] mt-0.5 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-[#B2BEC3] mt-1 font-semibold uppercase tracking-wider">
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
