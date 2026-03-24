'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    CreditCard,
    CheckCircle2,
    Loader2,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    ChevronRight,
    AlertCircle,
    Video,
    FileText,
    User,
    HeartPulse,
    History
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';

function BookingContent() {
    const { t, lang } = useLanguage();
    const [step, setStep] = useState(1); // 1: Select Date/Time, 2: Payment, 3: Confirmation
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('2026-03-05');
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [doctorId, setDoctorId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const docId = searchParams.get('doctor');
        if (docId) setDoctorId(docId);
    }, [searchParams]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            // Helper to convert 12h time to 24h
            const convertTo24h = (time12h: string) => {
                const [time, modifier] = time12h.split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM' && hours !== '12') {
                    hours = (parseInt(hours, 10) + 12).toString();
                }
                return `${hours.padStart(2, '0')}:${minutes}`;
            };

            const time24h = convertTo24h(selectedTime);

            // Send to backend
            await api.post('/patient/book-appointment', {
                doctor_id: parseInt(doctorId || '1'),
                appointment_datetime: `${selectedDate}T${time24h}:00`,
                booking_source: "AI"
            });

            // Simulate transition to confirmation
            setTimeout(() => {
                setStep(3);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("Failed to book appointment. Please try again.");
            setLoading(false);
        }
    };

    const dates = ['2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23'];
    const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

    return (
        <MainLayout title="My Appointments">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{lang === 'ta' ? "பாதுகாப்பான அப்பாயின்மென்ட் முன்பதிவு" : "Secure Appointment Booking"}</h1>
                    <div className="flex items-center space-x-2 text-emerald-600 font-bold text-[10px] mt-1 uppercase tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>HiPAA Compliant Secure Session</span>
                    </div>
                </div>

                {/* Progress Bar (simplified) */}
                <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= s ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                } transition-all duration-500`}
                        >
                            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Selection Area */}
                <div className="lg:col-span-2 space-y-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl glass-morphism border border-slate-100"
                            >
                                <h2 className="text-xl font-black mb-6 flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-sky-500" />
                                    <span>Select Date and Time</span>
                                </h2>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Choose Date</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {dates.map((date) => (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`p-3 rounded-[1rem] border-2 flex flex-col items-center justify-center transition-all ${selectedDate === date
                                                        ? 'border-sky-500 bg-sky-50 text-sky-600 shadow-sm'
                                                        : 'border-slate-50 text-slate-500 hover:border-sky-100'
                                                        }`}
                                                >
                                                    <span className="text-[9px] font-black uppercase mb-0.5">{new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                                    <span className="text-base font-black">{new Date(date).getDate()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Available Slots</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                            {times.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`p-3 rounded-lg border flex items-center justify-center space-x-2 font-bold text-sm transition-all ${selectedTime === time
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-transparent'
                                                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{time}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => setStep(2)} className="btn-primary py-3 px-8 rounded-xl flex items-center space-x-2 group text-sm">
                                        <span>{lang === 'ta' ? "பணம் செலுத்த தொடரவும்" : "Continue"}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl glass-morphism border border-slate-100"
                            >
                                <h2 className="text-xl font-black mb-6 flex items-center space-x-3">
                                    <CreditCard className="w-5 h-5 text-indigo-500" />
                                    <span>Secure Payment</span>
                                </h2>

                                <div className="p-8 bg-sky-50 rounded-[2.5rem] border border-sky-100 mb-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-sky-600 font-bold text-sm mb-1 uppercase tracking-widest">{lang === 'ta' ? "ஆலோசனை கட்டணம்" : "Consultation Fee"}</p>
                                        <h3 className="text-4xl font-black text-slate-900">₹750.00</h3>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl border-2 border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <CreditCard className="w-6 h-6 text-slate-400" />
                                            <span className="font-bold">Simulated Secure Payment Gateway</span>
                                        </div>
                                        <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-black uppercase text-slate-400 tracking-widest border border-slate-100">Sandboxed</div>
                                    </div>

                                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-4">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                                        <p className="text-sm text-amber-600 font-medium">This is a simulation. No real charges will be made. Clicking 'Pay Now' will complete the booking process.</p>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-center">
                                    <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-sky-500 transition-colors">{lang === 'ta' ? "பின்னால் செல்க" : "Go Back"}</button>
                                    <button
                                        disabled={loading}
                                        onClick={handleBooking}
                                        className="btn-primary py-4 px-12 rounded-2xl flex items-center space-x-3 group disabled:opacity-70 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>{lang === 'ta' ? "பணம் செலுத்தி உறுதிப்படுத்தவும்" : "Pay & Confirm Booking"}</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1" /></>}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl glass-morphism border border-slate-100 text-center"
                            >
                                <div className="w-24 h-24 bg-emerald-500 p-6 rounded-full inline-block mb-10 shadow-2xl shadow-emerald-500/30 animate-pulse">
                                    <CheckCircle2 className="w-full h-full text-white" />
                                </div>
                                <h2 className="text-4xl font-black mb-4">{lang === 'ta' ? "முன்பதிவு முடிந்தது!" : "You're All Set!"}</h2>
                                <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">{lang === 'ta' ? `டாக்டர் பிரியா ராமசாமி உடனான உங்கள் அப்பாயின்மென்ட் உறுதி செய்யப்பட்டுள்ளது.` : "Your appointment with Dr. Sarah Johnson is confirmed. A meeting link has been sent to your email."}</p>

                                <div className="grid md:grid-cols-2 gap-4 mb-12">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                                        <div className="flex items-center space-x-3 mb-2 text-sky-500">
                                            <CalendarIcon className="w-5 h-5" />
                                            <span className="font-black text-xs uppercase">Appointment</span>
                                        </div>
                                        <p className="font-bold text-lg">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-slate-500 font-medium">{selectedTime}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                                        <div className="flex items-center space-x-3 mb-2 text-indigo-500">
                                            <Video className="w-5 h-5" />
                                            <span className="font-black text-xs uppercase">Platform</span>
                                        </div>
                                        <p className="font-bold text-lg">HealthAI Video Session</p>
                                        <p className="text-slate-500 font-medium tracking-tight">Meeting ID: HAI-7283-912</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Link href="/patient/dashboard" className="btn-primary px-10 py-4 rounded-xl w-full sm:w-auto flex items-center justify-center">Go to Dashboard</Link>
                                    <button
                                        onClick={() => {
                                            alert("Preparing your medical invoice for download...");
                                            // Simulated download behavior
                                        }}
                                        className="btn-secondary px-10 py-4 rounded-xl flex items-center space-x-2 w-full sm:w-auto justify-center cursor-pointer"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Download Invoice</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar: Summary */}
                <div>
                    <div className="bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 shadow-2xl sticky top-24">
                        <h3 className="text-lg font-bold mb-6 text-sky-400">Booking Summary</h3>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-lg font-black">PR</div>
                                <div>
                                    <h4 className="font-bold text-sm">{lang === 'ta' ? "டாக்டர் பிரியா ராமசாமி" : "Dr. Priya Ramasamy"}</h4>
                                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">{lang === 'ta' ? "இதய நிபுணர் • 12 ஆண்டு அனுபவம்" : "Cardiologist • 12 Yrs Exp"}</p>
                                </div>
                            </div>

                            <div className="space-y-4 py-8 border-t border-b border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Consultation Fee</span>
                                    <span className="font-bold">₹750.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Service Fee</span>
                                    <span className="font-bold">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-4">
                                    <span className="font-black">{lang === 'ta' ? "மொத்தம்" : "Total"}</span>
                                    <span className="text-sky-400 font-black">₹750.00</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 text-sm text-slate-400">
                                    <History className="w-4 h-4 text-emerald-400" />
                                    <span className="italic">AI Diagnosis Reference: Headaches, High Fever</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-400">
                                    <User className="w-4 h-4 text-sky-400" />
                                    <span>Patient: Jane Doe (Primary)</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                            <HeartPulse className="w-10 h-10 text-sky-500/40 mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Secure Healthcare Platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default function AppointmentBooking() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
