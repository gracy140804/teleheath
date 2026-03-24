'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/i18n';

type Language = 'en' | 'ta';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang') as Language;
        if (savedLang) setLangState(savedLang);
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('app_lang', newLang);
    };

    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
