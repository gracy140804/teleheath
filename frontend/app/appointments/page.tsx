'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Video,
    FileText,
    RefreshCw,
    Wallet
} from 'lucide-react';
import api from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function MyAppointments() {
    const { t, lang } = useLanguage();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/patient/appointments');
            setAppointments(response.data);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId: number) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            if (appointmentId > 888000) {
                // Synthetic appointment - just update local state
                setAppointments(prev => prev.filter(a => a.id !== appointmentId));
                return;
            }
            await api.post(`/patient/appointment/${appointmentId}/cancel`);
            fetchAppointments();
        } catch (err) {
            console.error("Failed to cancel appointment:", err);
            alert("Failed to cancel appointment. Please try again.");
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { color: 'text-warning', bg: 'bg-orange-50', border: 'border-orange-100' };
            case 'CONFIRMED':
                return { color: 'text-success', bg: 'bg-blue-50', border: 'border-blue-100' };
            case 'REJECTED':
                return { color: 'text-error', bg: 'bg-red-50', border: 'border-red-100' };
            case 'COMPLETED':
                return { color: 'text-primary', bg: 'bg-blue-50', border: 'border-blue-100' };
            case 'RESCHEDULE_REQUESTED':
                return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: AlertCircle };
            case 'CANCELLED':
            default:
                return { color: 'text-muted', bg: 'bg-slate-50', border: 'border-slate-100', icon: CalendarIcon };
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString(lang === 'ta' ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <MainLayout title={t.appointmentsTitle}>
            <div className="max-w-6xl mx-auto space-y-8">

                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t.appointmentsTitle}</h1>
                    <p className="text-slate-500 font-medium">{t.appointmentsDesc}</p>
                </div>

                {loading ? (
                    <div className="flex flex-col space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-white rounded-[2rem] border border-slate-100"
                    >
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{t.noAppointments}</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t.noAppointmentsDesc}</p>
                        <Link href="/doctors" className="btn-primary py-3 px-8 rounded-full font-bold shadow-lg shadow-blue-500/20 inline-block">
                            {t.findDoctor}
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((appt, idx) => {
                            const statusConfig = getStatusConfig(appt.status);
                            const { date, time } = formatDateTime(appt.appointment_datetime);

                            return (
                                <motion.div
                                    key={appt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hospital-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                                >

                                    <div className="flex items-start gap-6 flex-1 w-full md:w-auto">
                                        <div className={`p-4 rounded-2xl shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground">Dr. {appt.doctor_name}</h3>
                                                    <p className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">{appt.specialization}</p>

                                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                                                        <div className="flex items-center gap-1.5 text-muted bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                                            {date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            <Clock className="w-4 h-4 text-warning" />
                                                            {time}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            <Wallet className="w-4 h-4 text-success" />
                                                            {appt.payment_status}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start lg:items-end gap-3 mt-2 lg:mt-0 lg:ml-auto">
                                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                                        {appt.status}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                                                            <button
                                                                onClick={() => handleCancel(appt.id)}
                                                                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        {appt.status === 'CONFIRMED' && (() => {
                                                            const startTime = new Date(appt.appointment_datetime).getTime();
                                                            const currentTime = new Date().getTime();
                                                            const endTime = startTime + 30 * 60 * 1000;
                                                            const isTooEarly = currentTime < startTime;
                                                            const isExpired = currentTime > endTime;

                                                            return (
                                                                <>
                                                                    <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                                                        Reschedule
                                                                    </button>
                                                                    {isTooEarly ? (
                                                                        <button disabled className="px-4 py-2 text-sm font-bold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed flex items-center gap-2">
                                                                            <Clock className="w-4 h-4" />
                                                                            Available at {time}
                                                                        </button>
                                                                    ) : isExpired ? (
                                                                        <button disabled className="px-4 py-2 text-sm font-bold text-slate-300 bg-slate-50 rounded-xl border border-slate-100 cursor-not-allowed">
                                                                            Session Ended
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => router.push(`/patient/video-call/${appt.id}?roomId=${appt.video_room_id}`)}
                                                                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 animate-pulse"
                                                                        >
                                                                            <Video className="w-4 h-4" />
                                                                            {t.joinCall}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                        {appt.status === 'COMPLETED' && (
                                                            <button 
                                                                onClick={() => router.push('/prescriptions')}
                                                                className="px-5 py-2.5 text-sm font-black text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-2 border border-blue-100 hover:border-blue-200 cursor-pointer shadow-sm active:scale-95"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                {t.viewPrescriptions}
                                                            </button>
                                                        )}
                                                        {appt.status === 'RESCHEDULE_REQUESTED' && (
                                                            <div className="flex flex-col gap-3 w-full border-t border-slate-100 pt-4 mt-2">
                                                                <div className="flex items-center gap-2 text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                                                    <Clock className="w-4 h-4" />
                                                                    <div className="text-xs font-bold font-medical">
                                                                        Doctor suggested new time: {appt.rescheduled_datetime ? formatDateTime(appt.rescheduled_datetime).date + " at " + formatDateTime(appt.rescheduled_datetime).time : "Pending"}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={async () => {
                                                                            await api.post(`/patient/appointment/${appt.id}/respond-reschedule`, { action: 'ACCEPT' });
                                                                            fetchAppointments();
                                                                        }}
                                                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                                    >
                                                                        Accept New Time
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            await api.post(`/patient/appointment/${appt.id}/respond-reschedule`, { action: 'DECLINE' });
                                                                            fetchAppointments();
                                                                        }}
                                                                        className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {appt.status === 'REJECTED' && (
                                                            <Link href="/doctors" className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                                                                <RefreshCw className="w-4 h-4" />
                                                                {t.bookAppointment}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
