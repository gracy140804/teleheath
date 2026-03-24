'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Activity,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    Sparkles,
    ChevronRight,
    Thermometer,
    AudioLines,
    Send,
    Volume2,
    Wand2,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';

// ─── Medical term normaliser ──────────────────────────────────────────────────
// Corrects voice-recognition errors for common medical terms before submission
const MEDICAL_CORRECTIONS: Record<string, string> = {
    // Cardiology
    "palpation": "palpitation",
    "papilation": "palpitation",
    "papilataion": "palpitation",
    "palipitation": "palpitation",
    "papilatation": "palpitation",
    "palpation of the heart": "palpitation",
    "heart palpation": "palpitation",
    "heart palitation": "palpitation",
    // Respiratory
    "short winded": "shortness of breath",
    "short of breath": "shortness of breath",
    "can't breathe": "difficulty breathing",
    "cannot breathe": "difficulty breathing",
    // Neuro
    "migrane": "migraine",
    "headpain": "headache",
    "vertigo": "dizziness",
    // GI
    "lose motion": "loose motion",
    "diorrhea": "diarrhea",
    "diaria": "diarrhea",
    "diarrhoea": "diarrhea",
    "stomachache": "stomach pain",
    "stomach ache": "stomach pain",
    "tummy ache": "stomach pain",
    "abdominal pain": "stomach pain",
    "nausious": "nausea",
    "noshia": "nausea",
    // Dermatology
    "eczima": "eczema",
    "psorasis": "psoriasis",
    "skin itching": "itchy skin",
    // ENT
    "ear ache": "earache",
    "sore through": "sore throat",
    "pain in throat": "sore throat",
    // General
    "tiredness": "fatigue",
    "feelingweak": "weakness",
    "feeling week": "weakness",
    "high fever": "fever",
    "temperature": "fever",
    "high temperature": "fever",
    "running a temperature": "fever",
    "bp": "blood pressure",
    "high bp": "high blood pressure",
};

function normaliseMedicalText(text: string): string {
    let result = text.toLowerCase();
    // Apply all corrections
    for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
        result = result.replace(new RegExp(wrong, 'gi'), right);
    }
    // Capitalise first letter
    return result.charAt(0).toUpperCase() + result.slice(1);
}

// ─── Audio level meter hook ───────────────────────────────────────────────────
function useAudioLevel(isRecording: boolean) {
    const [level, setLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const ctxRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isRecording) {
            setLevel(0);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const ctx = new AudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            ctxRef.current = ctx;
            sourceRef.current = source;
            analyserRef.current = analyser;

            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b, 0) / data.length;
                setLevel(Math.min(100, Math.round(avg * 2.5)));
                rafRef.current = requestAnimationFrame(tick);
            };
            tick();
        }).catch(() => { });

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ctxRef.current?.close();
        };
    }, [isRecording]);

    return level;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function SymptomsPage() {
    const { t, lang } = useLanguage();

    // State
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [micError, setMicError] = useState('');
    const [corrected, setCorrected] = useState(false);

    // Refs for stable recognition across renders
    const recognitionRef = useRef<any>(null);
    const audioLevel = useAudioLevel(isRecording);

    // ── Initialise Web Speech API (once) ───────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRec: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRec) return;

        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;   // ← More alternatives = better accuracy
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
            let finalText = '';
            let interimTxt = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                // Pick the best alternative by confidence
                let bestAlt = result[0];
                for (let a = 1; a < result.length; a++) {
                    if (result[a].confidence > bestAlt.confidence) {
                        bestAlt = result[a];
                    }
                }
                const transcript = bestAlt.transcript;
                if (result.isFinal) {
                    finalText += transcript;
                } else {
                    interimTxt += transcript;
                }
            }

            if (finalText) {
                setTranscribedText(prev => (prev ? prev.trimEnd() + ' ' : '') + finalText);
                setInterimText('');
            } else {
                setInterimText(interimTxt);
            }
        };

        rec.onerror = (err: any) => {
            // Ignore no-speech errors – they happen naturally in pauses
            if (err.error === 'no-speech') return;
            if (err.error === 'aborted') return;
            setMicError(`Voice error (${err.error}). Try again.`);
            setIsRecording(false);
        };

        rec.onend = () => {
            // If the browser stops unexpectedly, restart if still in recording mode
            if (recognitionRef.current?._shouldBeRunning) {
                try { rec.start(); } catch { }
            }
        };

        recognitionRef.current = rec;
        recognitionRef.current._shouldBeRunning = false;
    }, []);

    // ── Toggle recording ────────────────────────────────────────────────────────
    const toggleRecording = useCallback(async () => {
        setMicError('');
        const rec = recognitionRef.current;
        if (!rec) {
            setMicError('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (isRecording) {
            rec._shouldBeRunning = false;
            rec.stop();
            setIsRecording(false);
        } else {
            // Request mic permission explicitly so we get a clear error
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch {
                setMicError('Please allow microphone access to use voice input.');
                return;
            }
            rec.lang = 'en-US';
            rec._shouldBeRunning = true;
            try {
                rec.start();
                setIsRecording(true);
                setCorrected(false);
            } catch {
                setMicError('Could not start recording. Please try again.');
            }
        }
    }, [isRecording]);

    // ── Auto-correct medical spellings ──────────────────────────────────────────
    const handleAutoCorrect = useCallback(() => {
        setTranscribedText(prev => normaliseMedicalText(prev));
        setCorrected(true);
    }, []);

    // ── Submit to backend ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const domEl = document.getElementById('transcription-area') as HTMLTextAreaElement;
        const textToSubmit = transcribedText || domEl?.value;
        if (!textToSubmit?.trim()) return;

        // Auto-correct before submit for best analysis accuracy
        const cleanedText = normaliseMedicalText(textToSubmit.trim());

        setLoading(true);
        try {
            const response = await api.post('patient/submit-symptoms', {
                raw_text: cleanedText,
                recorded_language: 'en-US'
            });
            setAnalysisResult(response.data.extracted_data);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const msg = typeof detail === 'string' ? detail : JSON.stringify(detail) || err.message;
            alert('Error submitting symptoms: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Rendered transcription display text ─────────────────────────────────────
    const displayText = transcribedText + (interimText ? (transcribedText ? ' ' : '') + interimText : '');

    return (
        <MainLayout title="Symptom Analysis">
            <div className="max-w-4xl mx-auto w-full py-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">{t.recordSymptoms}</h2>
                    <p className="text-muted text-sm font-medium max-w-lg mx-auto">
                        {lang === 'ta'
                            ? 'உங்கள் அறிகுறிகளை ஆங்கிலத்தில் விவரிக்கவும். மருத்துவ AI பகுப்பாய்வு செய்யும்.'
                            : 'Describe your symptoms clearly. Our clinical AI will analyse and match you with the right specialist.'}
                    </p>
                </div>

                {/* Voice Recorder Card */}
                <div className="hospital-card p-8 flex flex-col items-center gap-6">
                    {/* Mic Button with Audio Visualiser */}
                    <div className="relative flex flex-col items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={toggleRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all relative z-10 ${isRecording
                                ? 'bg-error text-white shadow-error/20'
                                : 'bg-primary text-white shadow-primary/30'
                                }`}
                        >
                            {isRecording ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
                            {isRecording && (
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'easeOut' }}
                                    className="absolute inset-0 bg-error/30 rounded-full -z-10"
                                />
                            )}
                        </motion.button>

                        {/* Audio level bars */}
                        {isRecording && (
                            <div className="flex items-end gap-0.5 h-6">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-primary rounded-full"
                                        animate={{ height: `${Math.max(4, (audioLevel * (0.5 + Math.random() * 0.8)))}px` }}
                                        transition={{ duration: 0.1 }}
                                        style={{ maxHeight: '24px' }}
                                    />
                                ))}
                            </div>
                        )}

                        <p className="text-sm font-bold text-foreground text-center">
                            {isRecording
                                ? (lang === 'ta' ? 'கேட்கிறது... நிறுத்த தட்டவும்' : '🔴 Listening... Tap to stop')
                                : (lang === 'ta' ? 'பதிவைத் தொடங்க தட்டவும்' : 'Tap microphone to start recording')}
                        </p>

                        {/* Tips */}
                        {!isRecording && !transcribedText && (
                            <p className="text-xs text-muted text-center font-medium max-w-xs">
                                💡 Speak clearly and naturally, e.g. "I have a severe headache for 2 days" or "I feel nauseous and dizzy"
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {micError && (
                        <div className="w-full p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {micError}
                        </div>
                    )}

                    {/* Transcription area */}
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                                {lang === 'ta' ? 'உரை மாற்றம்' : 'Transcription'} (English)
                            </label>
                            {transcribedText && (
                                <button
                                    onClick={handleAutoCorrect}
                                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full transition-all ${corrected
                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        }`}
                                >
                                    <Wand2 className="w-3 h-3" />
                                    {corrected ? '✓ Corrected' : 'Auto-correct medical terms'}
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                id="transcription-area"
                                className="w-full min-h-[130px] max-h-[220px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-foreground font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm"
                                placeholder={lang === 'ta'
                                    ? 'உங்கள் ஆங்கில பேச்சு இங்கே தோன்றும்... அல்லது நேரடியாக தட்டச்சு செய்யலாம்'
                                    : 'Your transcription will appear here... or type your symptoms directly'}
                                value={displayText}
                                onChange={(e) => {
                                    setTranscribedText(e.target.value);
                                    setInterimText('');
                                    setCorrected(false);
                                }}
                            />
                            {interimText && (
                                <div className="absolute bottom-3 right-3">
                                    <span className="text-[10px] text-muted bg-slate-100 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                        recognising…
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Character count */}
                        {transcribedText && (
                            <p className="text-[10px] text-muted text-right">
                                {transcribedText.length} characters
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={() => { setTranscribedText(''); setInterimText(''); setAnalysisResult(null); setCorrected(false); }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-foreground font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            {lang === 'ta' ? 'அழிக்கவும்' : 'Clear'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!transcribedText.trim() || loading}
                            className="btn-primary flex-2 px-8 py-3 text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 justify-center flex-1"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Activity className="w-4 h-4" />
                                    {lang === 'ta' ? 'பகுப்பாய்வு செய்யவும்' : 'Analyze Symptoms'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Result */}
                <AnimatePresence>
                    {analysisResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            className="space-y-6"
                        >
                            <div className="hospital-card p-0 overflow-hidden border-blue-100 shadow-blue-500/5">
                                {/* Header */}
                                <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-base font-bold">
                                            {lang === 'ta' ? 'மருத்துவ AI பகுப்பாய்வு' : 'Clinical AI Analysis'}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-700 px-3 py-1 rounded-full">
                                        Med-BERT Verified
                                    </span>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Narrative */}
                                    {analysisResult.summary && (
                                        <div className="p-5 bg-blue-50/40 rounded-xl border border-blue-100">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                                                Narrative Summary
                                            </p>
                                            <p className="text-base font-semibold text-slate-800 leading-relaxed italic">
                                                "{analysisResult.summary}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Symptoms */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                                <Activity className="w-3.5 h-3.5 text-primary" />
                                                {lang === 'ta' ? 'அறிகுறிகள்' : 'Symptoms'}
                                            </p>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {analysisResult.symptoms?.length > 0
                                                    ? analysisResult.symptoms.map((s: string, i: number) => (
                                                        <span key={i} className="bg-blue-50 text-primary px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-100 capitalize">
                                                            {s}
                                                        </span>
                                                    ))
                                                    : <span className="text-muted text-xs italic">none identified</span>
                                                }
                                            </div>
                                        </div>

                                        {/* Severity */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                                <Thermometer className="w-3.5 h-3.5 text-error" />
                                                {lang === 'ta' ? 'தீவிரம்' : 'Severity'}
                                            </p>
                                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${analysisResult.severity === 'High'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : analysisResult.severity === 'Low'
                                                    ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                    : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {analysisResult.severity || 'Normal'}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                {lang === 'ta' ? 'காலம்' : 'Duration'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {analysisResult.duration || 'Not specified'}
                                            </p>
                                        </div>

                                        {/* Specialist */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-blue-600" />
                                                {lang === 'ta' ? 'பரிந்துரைக்கப்படும் நிபுணர்' : 'Specialist'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {analysisResult.recommended_spec || 'General Physician'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Emergency Alert */}
                                    {analysisResult.is_emergency && (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                            <div className="bg-red-500 p-2 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-700">
                                                    {lang === 'ta' ? 'அவசர எச்சரிக்கை!' : 'Emergency Alert!'}
                                                </p>
                                                <p className="text-xs text-red-600 font-medium">
                                                    {lang === 'ta'
                                                        ? 'இந்த அறிகுறிகளுக்கு உடனடி மருத்துவ கவனிப்பு தேவைப்படலாம்.'
                                                        : 'These symptoms may require immediate medical attention. Please seek emergency care.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <p className="text-sm font-medium text-slate-600">
                                                {lang === 'ta' ? 'அறிகுறிகள் வெற்றிகரமாக பதிவு செய்யப்பட்டன' : 'Symptoms successfully recorded'}
                                            </p>
                                        </div>
                                        <Link
                                            href="/doctors"
                                            className="btn-primary px-8 py-3 text-xs uppercase tracking-wider group flex items-center gap-2"
                                        >
                                            {lang === 'ta' ? 'நிபுணரை சந்திக்கவும்' : 'Connect with Specialist'}
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
