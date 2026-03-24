'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Beaker,
    Building2,
    Calendar,
    Clock,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ArrowRight,
    Activity,
    ShieldCheck,
    Search,
    AlertCircle
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type Step = 'TEST' | 'PROVIDER' | 'SLOT' | 'CONFIRM' | 'SUCCESS';

export default function LabSchedulingPage() {
    const { t, lang } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState<Step>('TEST');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data from Backend
    const [availableTests, setAvailableTests] = useState<any[]>([]);
    const [providers, setProviders] = useState<string[]>([]);

    // Selection State
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [testsResp, providersResp] = await Promise.all([
                    api.get('/labs/tests'),
                    api.get('/labs/providers')
                ]);
                setAvailableTests(testsResp.data);
                setProviders(providersResp.data);
            } catch (err) {
                console.error("Failed to fetch lab data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConfirmBooking = async () => {
        if (!selectedTest || !selectedProvider || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
            await api.post('/labs/book', {
                test_id: selectedTest.id,
                appointment_datetime: appointmentDateTime,
                provider_name: selectedProvider,
                notes: notes
            });
            setStep('SUCCESS');
        } catch (err) {
            alert(lang === 'ta' ? "முன்பதிவு தோல்வியடைந்தது. மீண்டும் முயலவும்." : "Booking failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderProgress = () => {
        const steps: Step[] = ['TEST', 'PROVIDER', 'SLOT', 'CONFIRM'];
        const currentIndex = steps.indexOf(step === 'SUCCESS' ? 'CONFIRM' : step);

        return (
            <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto px-4">
                {steps.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${i <= currentIndex ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                                {i < currentIndex ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${i <= currentIndex ? 'text-primary' : 'text-slate-400'}`}>
                                {s}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-grow h-0.5 mx-4 transition-all duration-1000 ${i < currentIndex ? 'bg-primary' : 'bg-slate-100'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderTestSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTests.map((test) => (
                <motion.div
                    key={test.id}
                    whileHover={{ y: -5 }}
                    onClick={() => { setSelectedTest(test); setStep('PROVIDER'); }}
                    className={`hospital-card p-8 cursor-pointer group transition-all duration-300 ${selectedTest?.id === test.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:border-primary/40'}`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                            <Beaker className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                        </div>
                        <span className="text-xl font-black text-primary">₹{test.price}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{test.name}</h3>
                    <p className="text-xs text-muted font-medium leading-relaxed line-clamp-2">{test.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        Select Test <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderProviderSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {providers.map((p) => (
                <motion.div
                    key={p}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { setSelectedProvider(p); setStep('SLOT'); }}
                    className={`hospital-card p-8 cursor-pointer flex items-center gap-6 transition-all ${selectedProvider === p ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary">
                        <Building2 className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg mb-1">{p}</h3>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-success" />
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Verified Partner</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </motion.div>
            ))}
        </div>
    );

    const renderSlotSelection = () => (
        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" /> Pick a Date
                </h4>
                <div className="grid grid-cols-4 gap-4">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(offset => {
                        const d = new Date();
                        d.setDate(d.getDate() + offset);
                        const dateStr = d.toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        return (
                            <button
                                key={offset}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`p-4 rounded-2xl border flex flex-col items-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/40'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="text-xl font-black">{d.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" /> Pick a Time
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    {["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"].map(time => (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-4 rounded-xl border text-xs font-bold transition-all ${selectedTime === time ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/40'}`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
                <div className="mt-auto pt-10">
                    <button
                        disabled={!selectedDate || !selectedTime}
                        onClick={() => setStep('CONFIRM')}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${(!selectedDate || !selectedTime) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95'}`}
                    >
                        Review Booking <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>
        </div>
    );

    const renderConfirmation = () => (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-900 text-white rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                    <Activity className="w-8 h-8 text-primary" />
                    Review Details
                </h2>

                <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-end border-b border-white/10 pb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Selected Test</p>
                            <h3 className="text-xl font-bold">{selectedTest.name}</h3>
                        </div>
                        <span className="text-2xl font-black text-primary">₹{selectedTest.price}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Provider</p>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-bold">{selectedProvider}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Timing</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-bold">{selectedDate} @ {selectedTime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Additional Notes</p>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Symptoms, medication, or specific instructions..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary transition-colors min-h-[120px]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => setStep('SLOT')} className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Go Back
                </button>
                <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="flex-[2] py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Submit Booking Request
                </button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="max-w-lg mx-auto py-20 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200"
            >
                <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 mb-6">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-12">
                Your lab appointment for <span className="text-primary font-bold">{selectedTest.name}</span> at <span className="text-slate-900 font-bold">{selectedProvider}</span> has been successfully registered.
                Please arrive at the clinic 10 minutes prior to your scheduled time.
            </p>

            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col gap-6 mb-12 text-left">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Reference Number</span>
                    <span className="text-primary">#LAB-{(Math.random() * 100000).toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-4 py-6 border-y border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900">{new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
                        <p className="text-xs font-bold text-slate-400">Scheduled at {selectedTime}</p>
                    </div>
                </div>
            </div>

            <button onClick={() => router.push('/labs')} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                Return to Lab Results
            </button>
        </div>
    );

    return (
        <MainLayout title="Schedule Lab Test">
            <div className="min-h-[85vh] py-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
                        {step === 'SUCCESS' ? 'Appointment Ready' : 'Secure Lab Booking'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {step === 'TEST' && 'Select the diagnostic procedure required by your physician.'}
                        {step === 'PROVIDER' && 'Choose a certified laboratory partner near you.'}
                        {step === 'SLOT' && 'Schedule a high-priority time for your sample collection.'}
                        {step === 'CONFIRM' && 'Finalize your medical diagnostic request.'}
                    </p>
                </div>

                {step !== 'SUCCESS' && renderProgress()}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />)}
                            </div>
                        ) : (
                            <>
                                {step === 'TEST' && renderTestSelection()}
                                {step === 'PROVIDER' && renderProviderSelection()}
                                {step === 'SLOT' && renderSlotSelection()}
                                {step === 'CONFIRM' && renderConfirmation()}
                                {step === 'SUCCESS' && renderSuccess()}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
