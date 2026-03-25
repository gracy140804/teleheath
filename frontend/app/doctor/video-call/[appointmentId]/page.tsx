'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    PhoneOff,
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    Maximize,
    User,
    Activity,
    ClipboardList,
    Clock,
    Calendar,
    Info,
    X,
    Droplets,
    RefreshCw,
    AlertCircle,
    WifiOff,
    MessageSquare,
    History,
    Stethoscope,
    FileText,
    Send,
    Plus,
    CheckCircle2,
    Settings,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function DoctorVideoCallContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = params.appointmentId as string;
    const roomId = searchParams.get('roomId');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const zegoContainerRef = useRef<HTMLDivElement>(null);
    const zpRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string;

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [patientName, setPatientName] = useState<string>("");
    
    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'consult' | 'chat'>('overview');
    const [consultNotes, setConsultNotes] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [followUpDate, setFollowUpDate] = useState("");
    
    const [clinicalData, setClinicalData] = useState<{
        patient_id: string;
        medical_history: string;
        current_symptom: string;
        analysed_symptom: string;
        severity: string;
        duration: string;
        recommendation_reason: string;
        clinical_summary: string;
        possible_conditions: string[];
        recommendation_context: string;
        patient_name: string;
        age: number;
        gender: string;
        blood_group: string;
        version: string;
        past_visits: any[];
        prescriptions: any[];
        lab_reports: any[];
    } | null>(null);

    const [isRetrying, setIsRetrying] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorType, setErrorType] = useState<'network' | 'unauthorized' | 'server' | null>(null);

    const verifyAccess = async (isRetry = false) => {
        if (isRetry) setIsRetrying(true);
        try {
            const res = await api.get(`/video/auth/${roomId}`);
            setIsAuthorized(true);
            setErrorType(null);
            
            const data = res.data.clinical_data || null;
            if (data) setClinicalData(data);
            if (data?.patient_name) setPatientName(data.patient_name);
            else setPatientName("Patient");
            
            startCamera();
        } catch (err: any) {
            console.error("Video Auth Error:", err);
            if (!err.response) {
                setErrorType('network');
            } else if (err.response.status >= 500) {
                setErrorType('server');
            } else {
                setErrorType('unauthorized');
                setIsAuthorized(false);
                setTimeout(() => {
                    router.push('/doctor/dashboard');
                }, 3000);
            }
        } finally {
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        if (!roomId) {
            setIsAuthorized(false);
            return;
        }

        verifyAccess();

        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [roomId]);

    const [showSettings, setShowSettings] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');

    const startCamera = async (vId?: string, aId?: string) => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: vId ? { deviceId: { exact: vId } } : true,
                audio: aId ? { deviceId: { exact: aId } } : true
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            streamRef.current = mediaStream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }

            // Update selected devices if not set
            if (!vId || !aId) {
                const tracks = mediaStream.getTracks();
                const vTrack = tracks.find(t => t.kind === 'video');
                const aTrack = tracks.find(t => t.kind === 'audio');
                if (vTrack && !selectedVideo) setSelectedVideo(vTrack.getSettings().deviceId || '');
                if (aTrack && !selectedAudio) setSelectedAudio(aTrack.getSettings().deviceId || '');
            }
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    useEffect(() => {
        if (isAuthorized && zegoContainerRef.current && !zpRef.current) {
            myMeeting(zegoContainerRef.current);
        }
        
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
                zpRef.current = null;
            }
        };
    }, [isAuthorized, roomId]);

    const myMeeting = async (element: HTMLDivElement) => {
        if (!appID || !serverSecret || !roomId || zpRef.current) return;
        
        try {
            // Generate Kit Token
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, 
                serverSecret, 
                roomId, 
                Date.now().toString(), 
                "Doctor"
            );

            // Create instance object from Kit Token.
            const zp = ZegoUIKitPrebuilt.create(kitToken);
            zpRef.current = zp;
            
            // start the call
            zp.joinRoom({
                container: element,
                sharedLinks: [
                    {
                        name: 'Personal link',
                        url:
                            window.location.protocol + '//' + 
                            window.location.host + window.location.pathname +
                            '?roomId=' + roomId,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showScreenSharingButton: true,
                showRoomDetailsButton: false,
                onLeaveRoom: () => {
                    handleEndCall();
                }
            });
        } catch (error) {
            console.error("Error joining Zego room:", error);
            zpRef.current = null;
        }
    };

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const handleEndCall = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (roomId) {
            try {
                await api.post(`/video/${roomId}/finalize`);
            } catch (err) {
                console.error("End call failed:", err);
            }
        }
        router.push('/doctor/dashboard');
    };

    const handleSettingsClick = async () => {
        try {
            const devs = await navigator.mediaDevices.enumerateDevices();
            setDevices(devs);
            setShowSettings(true);
        } catch (err) {
            console.error("Failed to enumerate devices:", err);
        }
    };

    const changeDevice = (type: 'video' | 'audio', id: string) => {
        if (type === 'video') {
            setSelectedVideo(id);
            startCamera(id, selectedAudio);
        } else {
            setSelectedAudio(id);
            startCamera(selectedVideo, id);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMsg = {
            id: Date.now(),
            text: chatInput,
            sender: 'doctor',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([...chatMessages, newMsg]);
        setChatInput("");
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleGeneratePrescription = () => {
        router.push(`/doctor/prescriptions/new?appointmentId=${appointmentId}&patientId=${clinicalData?.patient_id}`);
    };

    const handleFinalizeSession = async () => {
        if (!roomId) return;
        setIsFinalizing(true);
        try {
            await api.post(`/video/finalize-system`, {
                room_id: roomId,
                notes: consultNotes,
                follow_up_date: followUpDate
            });
            router.push('/doctor/dashboard');
        } catch (err: any) {
            console.error("Finalize session failed:", err);
            const status = err.response?.status;
            const detail = err.response?.data?.detail || err.message;
            alert(`Failed with Status: ${status} | Detail: ${JSON.stringify(detail)}`);
        } finally {
            setIsFinalizing(false);
        }
    };


    if (errorType === 'network' || errorType === 'server') {
        const isNetwork = errorType === 'network';
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6">
                    {isNetwork ? <WifiOff className="w-8 h-8 text-red-500" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">
                    {isNetwork ? 'Connection Lost' : 'Internal Server Error'}
                </h2>
                <p className="text-slate-400 max-w-sm text-center mb-8 leading-relaxed">
                    {isNetwork 
                        ? 'We couldn\'t connect to the medical server. Please check your internet or try again.'
                        : 'Something went wrong on our side. We are looking into it.'}
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                    >
                        Reload Page
                    </button>
                    <button 
                        onClick={() => verifyAccess(true)}
                        disabled={isRetrying}
                        className="px-8 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                        {isRetrying && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Retry Now
                    </button>
                </div>
            </div>
        );
    }

    if (errorType === 'unauthorized') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Access Denied</h2>
                <p className="text-slate-400 mb-6">You don't have permission to join this session.</p>
                <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Redirecting to Dashboard...</span>
                </div>
            </div>
        );
    }

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Authenticating Session...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col font-outfit overflow-hidden text-white">
            {/* Call Header */}
            <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-3xl z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">AI Tele-Consultation</h2>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Secure Live HD Session</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-white text-lg">
                        {formatTime(callDuration)}
                    </div>
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)} 
                        className={`p-3 rounded-xl transition-all border ${showSidebar ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'}`}
                        title="Intelligence Sidebar"
                    >
                        <Stethoscope className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSettingsClick} 
                        className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all border border-white/10 hover:bg-white/10"
                        title="Call Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-white leading-none capitalize">{patientName || 'Loading...'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{clinicalData?.patient_id || 'ID: 0000'}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
                        <User className="w-6 h-6 text-white opacity-40" />
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* 1. Video Canvas Area (Flex 1) */}
                <div className="flex-1 relative p-6 bg-slate-950 flex flex-col items-center justify-center">
                    <div className="w-full h-full max-h-[85vh] bg-slate-900 rounded-[3rem] overflow-hidden relative border border-white/5 shadow-2xl group">
                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                            <AnimatePresence>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-40 h-40 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/5 shadow-inner">
                                        <User className="w-20 h-20 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">{patientName}</h3>
                                    <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] animate-pulse">Initializing Video Stream...</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Zego container will be injected here via the ref and useEffect */}
                        <div 
                            className="w-full h-full" 
                            ref={zegoContainerRef}
                        />
                    </div>

                </div>

                {/* 2. Advanced Diagnostic Sidebar (W-96 or W-1/3) */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ x: 500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 500, opacity: 0 }}
                            className="w-[420px] bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 flex flex-col z-30 overflow-hidden"
                        >
                            {/* Tab Navigation */}
                            <div className="flex border-b border-white/5 bg-black/20 p-2 gap-1">
                                {[
                                    { id: 'overview', icon: ClipboardList, label: 'Overview' },
                                    { id: 'history', icon: History, label: 'History' },
                                    { id: 'consult', icon: Stethoscope, label: 'Consult' },
                                    { id: 'chat', icon: MessageSquare, label: 'Chat' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-primary/20 border border-primary/30 text-primary' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Scrollable Tab Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                        {/* Patient ID Card */}
                                        <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
                                                    <User className="w-8 h-8 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight leading-none">{clinicalData?.patient_name || patientName}</h3>
                                                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-1.5">{clinicalData?.patient_id || 'ID: 0000'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-black/20 p-3 rounded-2xl border border-white/5 text-center">
                                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Age</p>
                                                    <p className="text-sm font-bold">{clinicalData?.age || 'nil'}</p>
                                                </div>
                                                <div className="bg-black/20 p-3 rounded-2xl border border-white/5 text-center">
                                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Gender</p>
                                                    <p className="text-sm font-bold">{clinicalData?.gender || 'nil'}</p>
                                                </div>
                                                <div className="bg-black/20 p-3 rounded-2xl border border-white/5 text-center">
                                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Blood</p>
                                                    <p className="text-sm font-bold text-primary">{clinicalData?.blood_group || 'nil'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clinical Summary */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <FileText className="w-3.5 h-3.5 text-primary" />
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Clinical Summary</h4>
                                            </div>
                                            <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] relative overflow-hidden">
                                                <p className="text-sm font-medium leading-relaxed italic text-slate-200">
                                                    "{clinicalData?.clinical_summary || 'Waiting for clinical synthesis...'}"
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                                    <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                                                        <Activity className="w-3 h-3 text-primary" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Severity: {clinicalData?.severity || 'Normal'}</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Duration: {clinicalData?.duration || '1-2 Days'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Insights */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Diagnostic Insights</h4>
                                            </div>
                                            <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] space-y-4">
                                                <div>
                                                    <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mb-2">Possible Conditions</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {clinicalData?.possible_conditions?.map((cond, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-xs font-medium">{cond}</span>
                                                        )) || <span className="text-slate-600 text-xs italic">No data extracted</span>}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mb-2">Recommendation Context</p>
                                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                        {clinicalData?.recommendation_context || clinicalData?.recommendation_reason || 'AI is analysing context...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-6">
                                        {/* Medical History Section */}
                                        <div className="p-5 bg-white/5 border border-white/5 rounded-[2rem]">
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Info className="w-3 h-3" /> Chronic Medical History
                                            </p>
                                            <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                                                {clinicalData?.medical_history || 'No chronic history recorded.'}
                                            </p>
                                        </div>

                                        {/* Past Visits Timeline */}
                                        <div className="px-1 space-y-4">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Appointment History</p>
                                            {clinicalData?.past_visits?.map((visit, i) => (
                                                <div key={i} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
                                                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-slate-900 border border-white/20 rounded-full flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                    </div>
                                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-xs font-black text-white">{visit.doctor_name}</p>
                                                            <span className="text-[9px] text-slate-500 font-mono italic">{visit.date}</span>
                                                        </div>
                                                        <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest">{visit.specialization}</p>
                                                    </div>
                                                </div>
                                            )) || <p className="text-slate-600 text-xs italic ml-6">No past visits recorded.</p>}
                                        </div>

                                        {/* Past Prescriptions */}
                                        <div className="px-1 space-y-4">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Previous Prescriptions</p>
                                            <div className="grid gap-3">
                                                {clinicalData?.prescriptions?.map((p, i) => (
                                                    <div key={i} className="p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl flex items-center gap-4 group hover:bg-emerald-500/[0.05] transition-all">
                                                        <div className="p-2.5 bg-emerald-400/10 rounded-xl border border-emerald-400/20">
                                                            <FileText className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold leading-tight line-clamp-1 italic text-slate-300">"{p.notes}"</p>
                                                            <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">{p.date}</p>
                                                        </div>
                                                    </div>
                                                )) || <p className="text-slate-600 text-xs italic ml-1">No prescriptions found.</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'consult' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <FileText className="w-3.5 h-3.5 text-primary" />
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultation Notes</h4>
                                            </div>
                                            <textarea 
                                                value={consultNotes}
                                                onChange={(e) => setConsultNotes(e.target.value)}
                                                placeholder="Enter clinical observations, symptoms, or private notes here..."
                                                className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all custom-scrollbar bg-slate-900/40"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Follow-up Scheduling</h4>
                                            </div>
                                            <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                                                <input 
                                                    type="date"
                                                    value={followUpDate}
                                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                                    className="bg-transparent border-none text-white text-sm focus:outline-none flex-1 [color-scheme:dark]"
                                                />
                                                <div className="p-2 bg-primary/20 rounded-xl">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                            <button 
                                                onClick={handleGeneratePrescription}
                                                className="w-full py-4 bg-primary hover:bg-primary/80 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Generate Digital Prescription
                                            </button>
                                            <button 
                                                onClick={handleFinalizeSession}
                                                disabled={isFinalizing}
                                                className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                            >
                                                {isFinalizing ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                )}
                                                {isFinalizing ? 'Finalizing...' : 'Finalize Records & Close'}
                                            </button>
                                        </div>

                                    </motion.div>
                                )}

                                {activeTab === 'chat' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4 mb-4">
                                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-none max-w-[85%] self-start">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">AuraHealth AI assistant</p>
                                                <p className="text-xs leading-relaxed text-slate-200">Session started. You can securely chat with {patientName} here.</p>
                                            </div>
                                            
                                            {chatMessages.map((msg) => (
                                                <div 
                                                    key={msg.id} 
                                                    className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'doctor' ? 'bg-primary self-end ml-auto rounded-tr-none' : 'bg-white/10 border border-white/10 self-start rounded-tl-none'}`}
                                                >
                                                    <p className="text-xs leading-relaxed font-bold">{msg.text}</p>
                                                    <p className="text-[8px] opacity-60 mt-1.5 text-right font-mono">{msg.time}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center gap-3 shadow-2xl">
                                            <input 
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none px-2"
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                className="p-3 bg-primary rounded-2xl hover:bg-primary/80 transition-all"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <Settings className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">System Settings</h3>
                                </div>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Video Source (Camera)</label>
                                    <select
                                        value={selectedVideo}
                                        onChange={(e) => changeDevice('video', e.target.value)}
                                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        {devices.filter(d => d.kind === 'videoinput').map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Audio Source (Microphone)</label>
                                    <select
                                        value={selectedAudio}
                                        onChange={(e) => changeDevice('audio', e.target.value)}
                                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        {devices.filter(d => d.kind === 'audioinput').map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label || `Mic ${device.deviceId.slice(0, 5)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="w-full py-4 bg-primary hover:bg-primary/80 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DoctorVideoCallPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <Loader2 className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Initializing Secure Channel...</p>
            </div>
        }>
            <DoctorVideoCallContent />
        </Suspense>
    );
}
