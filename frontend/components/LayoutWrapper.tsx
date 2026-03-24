'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages that DO NOT want the global navbar and padding
    const dashboardPrefixes = ['/dashboard', '/symptoms', '/doctors', '/appointments', '/prescriptions', '/profile', '/admin', '/book-appointment', '/support', '/doctor', '/patient'];
    const authPages = ['/login', '/register'];

    const isNoNav = authPages.includes(pathname) || dashboardPrefixes.some(p => pathname.startsWith(p));

    // Landing page (/) will show the Navbar by default as isNoNav will be false

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');

        if (!token && dashboardPrefixes.some(p => pathname.startsWith(p))) {
            router.push('/login');
            return;
        }

        if (role) {
            if (pathname === '/admin/patients' && role === 'DOCTOR') {
                router.push('/doctor/patients');
                return;
            }

            if (pathname.startsWith('/doctor/') && role !== 'DOCTOR') {
                router.push('/login');
            } else if (pathname.startsWith('/patient/') && role !== 'PATIENT') {
                router.push('/login');
            } else if (pathname.startsWith('/admin')) {
                if (role !== 'ADMIN' && role !== 'DOCTOR') {
                    router.push('/login');
                }
            }
        }
    }, [pathname, router]);

    return (
        <LanguageProvider>
            {!isNoNav && <Navbar />}
            <div className={!isNoNav ? "pt-20" : ""}>
                {children}
            </div>
        </LanguageProvider>
    );
}
