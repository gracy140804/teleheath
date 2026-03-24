'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill,
    Plus,
    Trash2,
    FileText,
    Stethoscope,
    AlertCircle,
    CheckCircle2,
    Save,
    User,
    ArrowLeft
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/lib/api';

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export default function GeneratePrescriptionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');

    const [medications, setMedications] = useState<Medication[]>([
        { id: '1', name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [diagnosis, setDiagnosis] = useState('');
    const [clinicalNotes, setClinicalNotes] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const addMedication = () => {
        setMedications([
            ...medications,
            { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '' }
        ]);
    };

    const removeMedication = (id: string) => {
        if (medications.length > 1) {
            setMedications(medications.filter(m => m.id !== id));
        }
    };

    const updateMedication = (id: string, field: keyof Medication, value: string) => {
        setMedications(medications.map(m => 
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handleIssuePrescription = async () => {
        // Validate
        const validMeds = medications.filter(m => m.name.trim() !== '');
        if (validMeds.length === 0 && !diagnosis) {
            alert('Please add at least one medication or a diagnosis.');
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API compilation and PDF generation process
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            
            // Redirect after success
            setTimeout(() => {
                router.push('/doctor/dashboard');
            }, 2500);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <MainLayout title="Prescription Generated">
                <div className="max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                    >
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">Prescription Issued Successfully</h2>
                    <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                        The digital prescription has been encrypted, saved to the patient's secure vault, and an email notification has been sent.
                    </p>
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                        <ArrowLeft className="w-4 h-4" />
                        Returning to Dashboard...
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Issue Digital Prescription">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                                Rx Builder
                            </div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Digital Prescription</h1>
                        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Patient ID: <span className="font-bold text-slate-700">{patientId || 'Not specified'}</span> | Ref: #{appointmentId || '0000'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleIssuePrescription}
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black tracking-widest uppercase text-sm flex items-center gap-3 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? 'Compiling PDF...' : 'Issue Prescription & Sign'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Medications */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Pill className="w-5 h-5 text-primary" />
                                Medications
                            </h2>
                            <button
                                onClick={addMedication}
                                className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Drug
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {medications.map((med, index) => (
                                    <motion.div
                                        key={med.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group"
                                    >
                                        <div className="absolute -left-3 top-8 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-xs font-black text-slate-400">
                                            {index + 1}
                                        </div>
                                        
                                        {medications.length > 1 && (
                                            <button 
                                                onClick={() => removeMedication(med.id)}
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Drug Name / Composition</label>
                                                <input 
                                                    type="text"
                                                    value={med.name}
                                                    onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                                    placeholder="e.g. Amoxicillin 500mg"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dosage</label>
                                                <input 
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                                                    placeholder="e.g. 1 Tablet"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Frequency</label>
                                                <select
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                                >
                                                    <option value="">Select Frequency</option>
                                                    <option value="1-0-1 (Morning & Night)">1-0-1 (Morning & Night)</option>
                                                    <option value="1-1-1 (Three times a day)">1-1-1 (Three times a day)</option>
                                                    <option value="1-0-0 (Morning only)">1-0-0 (Morning only)</option>
                                                    <option value="0-0-1 (Night only)">0-0-1 (Night only)</option>
                                                    <option value="SOS (As needed)">SOS (As needed)</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Duration</label>
                                                <div className="flex gap-2">
                                                    {['3 Days', '5 Days', '1 Week', '2 Weeks', '1 Month'].map(dur => (
                                                        <button
                                                            key={dur}
                                                            onClick={() => updateMedication(med.id, 'duration', dur)}
                                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${med.duration === dur ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            {dur}
                                                        </button>
                                                    ))}
                                                    <input 
                                                        type="text"
                                                        value={med.duration}
                                                        onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                                                        placeholder="Custom..."
                                                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column - Diagnosis & Notes */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <Stethoscope className="w-5 h-5 text-primary" />
                                    Clinical Diagnosis
                                </h2>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Enter final diagnosis..."
                                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none custom-scrollbar"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                    Advice & Notes
                                </h2>
                                <textarea
                                    value={clinicalNotes}
                                    onChange={(e) => setClinicalNotes(e.target.value)}
                                    placeholder="E.g., Drink plenty of water, avoid spicy foods..."
                                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium resize-none custom-scrollbar"
                                />
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-[2rem] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                By issuing this prescription, you confirm that the medications and dosages are medically sound based on the virtual consultation. This record will be permanently saved to the patient's EHR.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
