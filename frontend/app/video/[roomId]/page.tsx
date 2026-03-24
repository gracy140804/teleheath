'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LegacyVideoRedirect() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const performRedirect = async () => {
            try {
                // We need to find the appointment ID for this roomId
                // Let's call the video auth endpoint which returns role info
                const authRes = await api.get(`/video/auth/${roomId}`);
                const role = localStorage.getItem('user_role');

                // Assuming we can get appointments and find the one with this roomId
                const apptEndpoint = role === 'DOCTOR' ? '/doctor/appointments' : '/patient/appointments';
                const apptsRes = await api.get(apptEndpoint);
                const appointment = apptsRes.data.find((a: any) => a.video_room_id === roomId);

                if (appointment) {
                    const targetBase = role === 'DOCTOR' ? '/doctor/video-call' : '/patient/video-call';
                    router.replace(`${targetBase}/${appointment.id}?roomId=${roomId}`);
                } else {
                    setError("Appointment context not found for this room.");
                }
            } catch (err: any) {
                console.error("Redirect failed:", err);
                setError(err.response?.data?.detail || "Unauthorized or invalid video room.");
                setTimeout(() => {
                    const role = localStorage.getItem('user_role');
                    router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
                }, 3000);
            }
        };

        performRedirect();
    }, [roomId, router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Redirecting to Secure Consultation...</h2>
                <p className="text-slate-400 text-sm">Validating your session and role isolation.</p>
                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 max-w-sm mx-auto flex items-center gap-3">
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-semibold">{error}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
