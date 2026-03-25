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
    Settings,
    Shield,
    User,
    Activity,
    ClipboardList,
    Clock,
    Calendar,
    Info,
    X,
    Droplets,
    Edit3,
    Check,
    Save,
    AlertCircle,
    WifiOff,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function PatientVideoCallContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = params.appointmentId as string;
    const roomId = searchParams.get('roomId');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
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
    const [clinicalData, setClinicalData] = useState<{
        medical_history: string;
        current_symptom: string;
        analysed_symptom: string;
        recommendation_reason: string;
        clinical_summary: string;
        age: number;
        gender: string;
        blood_group: string;
        version: string;
        past_visits: any[];
        prescriptions: any[];
        lab_reports: any[];
    } | null>(null);
    const [showClinicalInfo, setShowClinicalInfo] = useState(false);
    
    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editAge, setEditAge] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editBloodGroup, setEditBloodGroup] = useState('');
    const [editMedicalHistory, setEditMedicalHistory] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorType, setErrorType] = useState<'network' | 'unauthorized' | 'server' | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const verifyAccess = async (isRetry = false) => {
        if (isRetry) setIsRetrying(true);
        try {
            const res = await api.get(`/video/auth/${roomId}`);
            const data = res.data.clinical_data || null;
            if (data) {
                setClinicalData(data);
                setEditAge(data.age?.toString() || '');
                setEditGender(data.gender || '');
                setEditBloodGroup(data.blood_group || '');
                setEditMedicalHistory(data.medical_history || '');
            }
            setIsAuthorized(true);
            setErrorType(null);
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
                    router.push('/patient/dashboard');
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
                "Patient"
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
                showScreenSharingButton: false,
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
        try {
            if (roomId) {
                await api.post(`/video/${roomId}/finalize`);
            }
        } catch (err) {
            console.error("Failed to end call record:", err);
        } finally {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            router.push('/patient/dashboard');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            await api.post('/video/profile/update', {
                age: editAge,
                gender: editGender,
                blood_group: editBloodGroup,
                medical_history: editMedicalHistory
            });
            
            // Re-fetch to sync
            const res = await api.get(`/video/auth/${roomId}`);
            setClinicalData(res.data.clinical_data);
            setIsEditingProfile(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Profile update failed:", err);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (errorType === 'network' || errorType === 'server') {
        const isNetwork = errorType === 'network';
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 font-outfit">
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
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
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
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Access Denied</h2>
                <p className="text-slate-400 mb-6">You don't have permission to join this session.</p>
                <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
                    <Check className="w-4 h-4" />
                    <span>Redirecting to Dashboard...</span>
                </div>
            </div>
        );
    }

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Joining Secure Stream...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0F172A] flex flex-col font-inter overflow-hidden">
            {/* Call Header */}
            <div className="h-20 px-8 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white tracking-tight uppercase">Patient View: Consultation #{appointmentId}</p>
                        <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Secure Link Established
                        </p>
                    </div>
                </div>

                <div className="bg-slate-800/80 px-6 py-2 rounded-2xl border border-slate-700 font-mono text-white text-sm tracking-widest">
                    {formatTime(callDuration)}
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSettingsClick} className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-all border border-slate-700/50">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowClinicalInfo(!showClinicalInfo)} 
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-xl transition-all ${showClinicalInfo ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="View Consultation Context"
                    >
                        <ClipboardList className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Area with Sidebar */}
            <div className="flex-1 relative flex overflow-hidden">
                {/* Remote Video / Main Canvas */}
                <div className="flex-1 relative p-6">
                    <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden relative border border-slate-700/50 group shadow-2xl">
                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-600 shadow-inner">
                                    <User className="w-16 h-16 text-slate-500" />
                                </div>
                                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Video Stream...</p>
                            </div>
                        </div>
                        {/* Zego container will be injected here via the ref and useEffect */}
                        <div 
                            className="w-full h-full" 
                            ref={zegoContainerRef}
                        />
                    </div>

                </div>

                {/* Clinical Info Sidebar */}
                <AnimatePresence>
                    {showClinicalInfo && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="w-96 bg-slate-900/60 backdrop-blur-3xl border-l border-slate-700/50 p-8 overflow-y-auto z-20 flex-shrink-0 custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <ClipboardList className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Consultation Details</h3>
                                </div>
                                <button
                                    onClick={() => setShowClinicalInfo(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>


                            {/* Identity Card */}
                            <div className="mb-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-5 text-blue-500">
                                    <User className="w-20 h-20 -mr-4 -mt-4" />
                                </div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                                <User className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black text-lg leading-tight">Patient Identity</h3>
                                                <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mt-0.5">ID #{appointmentId}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                                            className="p-2 bg-slate-800/80 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 group-hover:border-blue-500/50"
                                        >
                                            {isEditingProfile ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {!isEditingProfile ? (
                                        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" /> {clinicalData?.age || 'nil'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-xs text-slate-300 font-bold">{clinicalData?.gender || 'nil'}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-xs text-blue-400 font-black flex items-center gap-1.5">
                                                <Droplets className="w-3.5 h-3.5 text-blue-500" /> {clinicalData?.blood_group || 'nil'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-blue-500/30">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Age</label>
                                                    <input 
                                                        type="text" 
                                                        value={editAge} 
                                                        onChange={(e) => setEditAge(e.target.value)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                        placeholder="e.g. 25"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Gender</label>
                                                    <input 
                                                        type="text" 
                                                        value={editGender} 
                                                        onChange={(e) => setEditGender(e.target.value)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                        placeholder="e.g. Female"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Blood Group</label>
                                                <input 
                                                    type="text" 
                                                    value={editBloodGroup} 
                                                    onChange={(e) => setEditBloodGroup(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                    placeholder="e.g. O+"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Summary Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-3.5 h-3.5 text-blue-400" />
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultation Summary</h4>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl shadow-lg relative overflow-hidden">
                                        <p className="text-sm text-slate-100 font-medium leading-relaxed italic relative z-10">
                                            "{clinicalData?.clinical_summary || 'No summary available.'}"
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason for Joining Now</h4>
                                    </div>
                                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl relative overflow-hidden">
                                        <div className="absolute -top-2 -right-2 p-4 opacity-10">
                                            <Activity className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 opacity-60">Analysed Symptom</p>
                                        <p className="text-sm text-slate-100 font-bold leading-tight">
                                            {clinicalData?.analysed_symptom || clinicalData?.current_symptom || 'General Consultation'}
                                        </p>
                                        {clinicalData?.recommendation_reason && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                    {clinicalData.recommendation_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-2 px-1">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinical Summary</h4>
                                    <span className="text-[8px] text-slate-600 font-mono">v{clinicalData?.version || '0.0'}</span>
                                </div>
                                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest opacity-60">Medical History</p>
                                                {isEditingProfile && (
                                                    <span className="text-[8px] text-slate-500 font-bold animate-pulse uppercase">Editing Mode</span>
                                                )}
                                            </div>
                                            {!isEditingProfile ? (
                                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                    {clinicalData?.medical_history || 'nil'}
                                                </p>
                                            ) : (
                                                <textarea 
                                                    value={editMedicalHistory}
                                                    onChange={(e) => setEditMedicalHistory(e.target.value)}
                                                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:border-blue-500 focus:outline-none custom-scrollbar"
                                                    placeholder="Enter medical history, allergies, or previous surgeries..."
                                                />
                                            )}
                                        </div>

                                        {isEditingProfile && (
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={isUpdating}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isUpdating ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : <Save className="w-4 h-4" />}
                                                {isUpdating ? 'Saving...' : 'Save New Data'}
                                            </button>
                                        )}

                                        {clinicalData?.past_visits && clinicalData.past_visits.length > 0 && (
                                            <div className="pt-4 border-t border-slate-700/50">
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 opacity-60">Past Visits</p>
                                                <div className="space-y-3">
                                                    {clinicalData.past_visits.map((visit: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-white text-xs font-bold">{visit.doctor_name}</p>
                                                                <p className="text-[10px] text-slate-500">{visit.specialization}</p>
                                                            </div>
                                                            <p className="text-[10px] text-slate-600 font-mono">{visit.date}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {clinicalData?.lab_reports && clinicalData.lab_reports.length > 0 && (
                                            <div className="pt-4 border-t border-slate-700/50">
                                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3 opacity-60">Recent Lab Tests</p>
                                                <div className="space-y-3">
                                                    {clinicalData.lab_reports.map((report: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                                                            <p className="text-white text-xs font-bold">{report.test_name}</p>
                                                            <p className="text-[10px] text-slate-500 mt-1">{report.provider} • {report.date}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-[11px] text-emerald-500 font-bold leading-normal">
                                        Data updated here reflects instantly for your doctor. Ensure information is accurate.
                                    </p>
                                </div>
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
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Settings className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Call Settings</h3>
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Camera Source</label>
                                    <select
                                        value={selectedVideo}
                                        onChange={(e) => changeDevice('video', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {devices.filter(d => d.kind === 'videoinput').map(device => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Microphone Source</label>
                                    <select
                                        value={selectedAudio}
                                        onChange={(e) => changeDevice('audio', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
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
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
                                    >
                                        Done & Save
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

export default function PatientVideoCallPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 font-outfit">
                <Loader2 className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Joining Secure Stream...</p>
            </div>
        }>
            <PatientVideoCallContent />
        </Suspense>
    );
}
