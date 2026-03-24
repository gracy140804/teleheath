'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Star,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    ChevronRight,
    Search,
    Activity,
    ChevronLeft,
    Heart,
    Brain,
    Bone,
    Eye,
    Ear,
    Smile,
    Tablets,
    Dna,
    Baby,
    Syringe,
    Accessibility,
    BadgeAlert,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';

// Icon mapping for departments
const IconMap: { [key: string]: any } = {
    Stethoscope,
    Heart,
    Sparkles,
    Bone,
    Brain,
    Apple: Activity, // Fallback for Gastroenterologist
    Smile,
    Ear,
    Eye,
    Activity
};

type ViewState = 'TABS' | 'SPECIALISTS' | 'BOOKING' | 'SUCCESS';
type BookingMode = 'AI' | 'MANUAL';

export default function AppointmentBookingHub() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // States
    const [bookingMode, setBookingMode] = useState<BookingMode>('AI');
    const [viewState, setViewState] = useState<ViewState>('TABS');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // AI Recommendations Data
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [detectedSpec, setDetectedSpec] = useState<string>('');
    const [detectedCondition, setDetectedCondition] = useState<string>('');
    const [aiMessage, setAiMessage] = useState<string>('');
    const [emergencyAlert, setEmergencyAlert] = useState<boolean>(false);
    const [detectedSymptoms, setDetectedSymptoms] = useState<string[]>([]);
    const [detectedSeverity, setDetectedSeverity] = useState<string>('');
    const [detectedDuration, setDetectedDuration] = useState<string>('');

    // Manual Booking Data
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [specialists, setSpecialists] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

    // Booking Form State
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Parallel fetch for efficiency
                const [aiResponse, deptResponse, specialistsResponse] = await Promise.all([
                    api.get('patient/recommend-doctors').catch(e => ({ data: {} })),
                    api.get('patient/departments').catch(e => ({ data: [] })),
                    api.get('patient/departments/General Physician/doctors').catch(e => ({ data: [] }))
                ]);

                // AI Recommendations
                if (aiResponse.data.recommended_doctors) {
                    setAiRecommendations(aiResponse.data.recommended_doctors);
                    setDetectedSpec(aiResponse.data.detected_specialization || aiResponse.data.recommended_specialization);
                    setDetectedCondition(aiResponse.data.detected_condition || "");
                    setAiMessage(aiResponse.data.message || '');
                    setEmergencyAlert(!!aiResponse.data.emergency_alert);
                    setDetectedSymptoms(aiResponse.data.detected_symptoms || []);
                    setDetectedSeverity(aiResponse.data.detected_severity || '');
                    setDetectedDuration(aiResponse.data.detected_duration || '');
                }

                // Departments
                setDepartments(deptResponse.data);

                // Fallback Specialists
                setSpecialists(specialistsResponse.data);
            } catch (err) {
                console.error("Failed to fetch initial booking data", err);
                setError("Failed to connect to the medical network. Please refresh or try again shortly.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch specialists when department changes
    const handleDeptSelect = async (deptName: string) => {
        setSelectedDept(deptName);
        setLoading(true);
        try {
            const resp = await api.get(`patient/departments/${deptName}/doctors`);
            setSpecialists(resp.data);
            setViewState('SPECIALISTS');
        } catch (err) {
            console.error("Failed to fetch specialists", err);
            setError("Unable to load specialists for this department right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle initial slot selection
    const startBooking = (doctor: any) => {
        setSelectedDoctor(doctor);
        setViewState('BOOKING');
        // Pre-set some dates for the mock picker
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    };

    // Confirm Booking
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
            const doctorId = selectedDoctor.id || selectedDoctor.doctor_id || selectedDoctor.profile?.id;

            await api.post('patient/book-appointment', {
                doctor_id: doctorId,
                appointment_datetime: appointmentDateTime,
                booking_source: bookingMode
            });
            setViewState('SUCCESS');
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || "Failed to book appointment. Please try again.";
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper: Render Tab Switcher
    const renderTabs = () => (
        <div className="flex p-0.5 bg-slate-100 rounded-lg mb-6 w-full max-w-sm mx-auto">
            <button
                onClick={() => { setBookingMode('MANUAL'); setViewState('TABS'); }}
                className={`flex-1 py-2 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${bookingMode === 'MANUAL' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
                Manual Booking
            </button>
            <button
                onClick={() => setBookingMode('AI')}
                className={`flex-1 py-2 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${bookingMode === 'AI' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
                AI Recommendation
            </button>
        </div>
    );

    // TIER 1: AI Recommendation View
    const renderAIView = () => (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 mb-6 group animate-fade-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                    <button onClick={() => { setError(null); window.location.reload(); }} className="ml-auto bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-colors">
                        Refresh
                    </button>
                </div>
            )}
            {emergencyAlert && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4"
                >
                    <div className="bg-red-500 p-2.5 rounded-lg shadow-md shadow-red-200">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-700 uppercase tracking-tighter">Emergency Alert</h3>
                        <p className="text-[11px] text-red-600 font-bold leading-tight">
                            Immediate medical attention recommended. Please call emergency services (108) if symptoms are severe.
                        </p>
                    </div>
                </motion.div>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold mb-2 border border-blue-100">
                        <Sparkles className="w-3 h-3" />
                        <span>AI RECOMMENDED</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground mb-1 uppercase">Specialist Matches</h2>
                </div>
            </div>

            {/* Analysis Summary Bar */}
            {(detectedSymptoms.length > 0 || detectedSeverity || detectedDuration) && (
                <div className="bg-white border border-slate-100 rounded-xl py-3 px-6 shadow-sm">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                <Activity className="w-3 h-3 text-primary" />
                                Symptoms
                            </p>
                            <div className="flex gap-1 flex-wrap">
                                {detectedSymptoms.length > 0 ? detectedSymptoms.slice(0, 3).map((s, i) => (
                                    <span key={i} className="bg-blue-50 text-primary px-1.5 py-0.5 rounded text-[9px] font-semibold border border-blue-100 capitalize">
                                        {s}
                                    </span>
                                )) : <span className="text-muted text-[10px] italic">none identified</span>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                <BadgeAlert className="w-3 h-3 text-error" />
                                Severity
                            </p>
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block ${detectedSeverity === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                {detectedSeverity || 'Moderate'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-500" />
                                Duration
                            </p>
                            <p className="text-[10px] font-bold text-slate-700">{detectedDuration || 'Unknown'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                <Stethoscope className="w-3 h-3 text-blue-600" />
                                Specialist
                            </p>
                            <p className="text-[10px] font-bold text-slate-700">{detectedSpec || 'General Physician'}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                {(aiRecommendations.length > 0 ? aiRecommendations : specialists).slice(0, 4).map((rec: any, idx: number) => (
                    <DoctorCard
                        key={rec.doctor_id || rec.id || `ai-${idx}`}
                        doctor={rec}
                        idx={idx}
                        onBook={() => startBooking(rec)}
                        isAI={true}
                    />
                ))}
                {(!aiRecommendations.length && !specialists.length) && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">Initializing premium medical network...</p>
                    </div>
                )}
            </div>
        </div>
    );

    // TIER 2: Manual Department Grid
    const renderDepartmentGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.map((dept, i) => {
                const Icon = IconMap[dept.icon] || Stethoscope;
                return (
                    <motion.div
                        key={i}
                        whileHover={{ y: -3 }}
                        className="hospital-card p-4 flex flex-col items-center text-center cursor-pointer group hover:border-primary/40 transition-all"
                        onClick={() => handleDeptSelect(dept.name)}
                    >
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
                            <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-bold text-[11px] text-foreground mb-1 leading-tight">{dept.name}</h3>
                        <p className="text-[9px] text-muted font-medium leading-tight mb-2 line-clamp-2">{dept.description}</p>
                    </motion.div>
                );
            })}
        </div>
    );

    // TIER 3: Specialists in Department
    const renderSpecialistList = () => (
        <div className="space-y-10">
            <button onClick={() => setViewState('TABS')} className="flex items-center gap-2 text-muted hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Back to Departments
            </button>

            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-foreground mb-1 uppercase leading-tight">{selectedDept}</h2>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Select a specialist for consultation</p>
            </div>

            {specialists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                    {specialists.map((doc, idx) => (
                        <DoctorCard key={doc.id} doctor={doc} idx={idx} onBook={() => startBooking(doc)} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">Doctors are currently being updated. Please try again shortly.</p>
                </div>
            )}
        </div>
    );

    // TIER 4: Slot Booking
    const renderBookingForm = () => {
        const schedule = selectedDoctor.profile?.availability_schedule || selectedDoctor.availability_schedule || {};
        const simulatedSlots = selectedDoctor.profile?.available_slots || [];
        const days = Object.keys(schedule);

        return (
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setViewState(bookingMode === 'AI' ? 'TABS' : 'SPECIALISTS')} className="flex items-center gap-2 text-muted hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-10">
                    <ChevronLeft className="w-4 h-4" /> Back to List
                </button>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left: Doctor Info */}
                    <div className="lg:col-span-1">
                        <div className="hospital-card p-8 sticky top-24">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary mb-6 border-4 border-white shadow-sm">
                                    {(selectedDoctor.profile?.name || selectedDoctor.name || "D").charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-1">Dr. {selectedDoctor.profile?.name || selectedDoctor.name}</h3>
                                <p className="text-primary font-bold text-xs uppercase tracking-widest mb-6">{selectedDoctor.profile?.specialization || selectedDoctor.specialization}</p>

                                <div className="w-full space-y-4 text-left border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted">Experience</span>
                                        <span className="text-foreground font-bold">{selectedDoctor.profile?.experience || selectedDoctor.experience || 10} Years</span>
                                    </div>
                                    <div className="flex justify-between items-start text-xs font-medium gap-4">
                                        <span className="text-muted whitespace-nowrap pt-0.5">Qualification</span>
                                        <span className="text-foreground font-bold text-right leading-relaxed">{selectedDoctor.profile?.qualification || selectedDoctor.qualification || 'MBBS, MD'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted">Consultation Fee</span>
                                        <span className="text-success font-bold">₹{selectedDoctor.profile?.consultation_fee || selectedDoctor.consultation_fee || 500}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Slot Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> Select Consultation Date
                            </h4>
                            <div className="grid grid-cols-4 gap-3">
                                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + offset);
                                    const dateStr = d.toISOString().split('T')[0];
                                    const isSelected = selectedDate === dateStr;
                                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                                    const dayNum = d.getDate();

                                    return (
                                        <button
                                            key={offset}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className={`p-4 rounded-xl border flex flex-col items-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/40'}`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{dayName}</span>
                                            <span className="text-lg font-black">{dayNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Available Time Slots
                            </h4>
                            {selectedDate ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {/* Combine real schedule with simulated slots for the selected date */}
                                    {(simulatedSlots.filter((slot: string) => slot.startsWith(selectedDate)).map((slot: string) => slot.split(' ')[1])
                                        .concat(schedule[new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })] || [])
                                        .filter((v: any, i: any, a: any) => a.indexOf(v) === i) // Unique
                                        .sort()
                                        .length > 0 ?
                                        simulatedSlots.filter((slot: string) => slot.startsWith(selectedDate)).map((slot: string) => slot.split(' ')[1])
                                            .concat(schedule[new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })] || [])
                                            .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
                                            .sort() :
                                        ["09:00", "10:30", "14:00", "16:00"]
                                    ).map((time: string) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 px-4 rounded-lg border text-xs font-bold transition-all ${selectedTime === time ? 'bg-primary border-primary text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/40'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted font-medium italic">Please select a date first to see available slots.</p>
                            )}
                        </section>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={!selectedDate || !selectedTime || isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${(!selectedDate || !selectedTime) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 active:scale-95'}`}
                        >
                            {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Confirm Appointment
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // TIER 5: Success State
    const renderSuccess = () => (
        <div className="max-w-lg mx-auto py-20 text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-medical">Appointment Request Sent!</h2>
            <p className="text-muted font-medium mb-10">Your consultation with Dr. {selectedDoctor.profile?.name || selectedDoctor.name} has been requested successfully. You will receive a notification once it is confirmed.</p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 text-left">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Appointment ID</span>
                    <span className="text-xs font-bold text-primary">HA-{(Math.random() * 10000).toFixed(0)}</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {selectedTime}
                    </div>
                </div>
            </div>

            <Link href="/patient/dashboard" className="btn-primary w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center">
                Go to Dashboard
            </Link>
        </div>
    );

    return (
        <MainLayout title="Book Appointment">
            <div className="min-h-[80vh]">
                {(viewState === 'TABS' || (viewState === 'SPECIALISTS' && bookingMode === 'MANUAL')) && renderTabs()}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${bookingMode}-${viewState}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>)}
                            </div>
                        ) : (
                            <>
                                {bookingMode === 'AI' && viewState === 'TABS' && renderAIView()}
                                {bookingMode === 'AI' && viewState === 'BOOKING' && renderBookingForm()}

                                {bookingMode === 'MANUAL' && viewState === 'TABS' && renderDepartmentGrid()}
                                {bookingMode === 'MANUAL' && viewState === 'SPECIALISTS' && renderSpecialistList()}
                                {bookingMode === 'MANUAL' && viewState === 'BOOKING' && renderBookingForm()}

                                {viewState === 'SUCCESS' && renderSuccess()}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}

// Sub-component: Doctor Card
function DoctorCard({ doctor, idx, onBook, isAI = false }: any) {
    // Robustly handle different data structures (AI vs Manual)
    const profile = (isAI && doctor.profile) ? doctor.profile : (doctor.profile || doctor);
    let docName = profile.full_name || profile.name || doctor.full_name || doctor.name || "Specialist";
    // Robustly remove existing "Dr. " or "Dr." to avoid "Dr. Dr. Name"
    docName = docName.replace(/^(Dr\.\s*|Dr\s+)/i, "").trim();
    const specialization = profile.specialization || doctor.specialization || "Medical Professional";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
        >
            <div className="hospital-card p-4 h-full flex flex-col items-center text-center relative hover:border-primary/40 transition-all duration-300">
                {isAI && idx === 0 && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        Best Match
                    </div>
                )}

                <div className="mb-4 relative">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-primary border-4 border-white shadow-sm">
                        {docName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-success p-0.5 rounded-full border-2 border-white">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>

                <div className="flex-grow">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">Dr. {docName}</h3>
                    <p className="text-primary font-bold text-[9px] uppercase tracking-wider mb-4 leading-tight">{specialization}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="text-warning flex items-center justify-center gap-1 mb-0.5">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold text-foreground">{profile.rating || '4.9'}</span>
                            </div>
                            <p className="text-[8px] uppercase font-bold text-muted tracking-tight">Rating</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="text-primary font-bold text-[10px] mb-0.5">{profile.experience || '10'}+ Yrs</div>
                            <p className="text-[8px] uppercase font-bold text-muted tracking-tight">Exp.</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-8 text-left px-1">
                        <div className="flex items-center gap-3 text-[11px] text-muted font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary/60" />
                            <span className={profile.next_available_slot ? "text-success font-bold" : ""}>
                                {profile.next_available_slot ? (
                                    (() => {
                                        const [date, time] = profile.next_available_slot.split(' ');
                                        const today = new Date().toISOString().split('T')[0];
                                        return date === today ? `Today ${time}` : `${date} ${time}`;
                                    })()
                                ) : "Mon-Fri · Available"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1.5 px-3 bg-blue-50 text-success rounded-lg font-bold border border-blue-100/50">
                            <span>Consultation Fee</span>
                            <span>₹{profile.consultation_fee || '500'}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onBook}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                    Book Appointment
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
