'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    UploadCloud,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Shield
} from 'lucide-react';
import api from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/components/LanguageContext';

export default function ProfilePage() {
    const { t, lang } = useLanguage();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        blood_group: '',
        weight: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const initialData = React.useRef({
        name: '',
        age: '',
        gender: '',
        blood_group: '',
        weight: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Get general user data first
                const userRes = await api.get('auth/me');

                // Get patient specific profile data
                const profileRes = await api.get('patient/profile');

                setUserProfile(userRes.data);
                const data = {
                    name: userRes.data.name || '',
                    age: profileRes.data.age || '',
                    gender: profileRes.data.gender || '',
                    blood_group: profileRes.data.blood_group || '',
                    weight: profileRes.data.weight || '',
                    phone: profileRes.data.phone || '',
                    address: profileRes.data.address || ''
                };
                setFormData(data);
                initialData.current = data;
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleCancel = () => {
        setFormData(initialData.current);
        setMessage(lang === 'ta' ? 'மாற்றங்கள் ரத்து செய்யப்பட்டன' : 'Changes discarded');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const BACKEND_ROOT = (api.defaults.baseURL || '').replace('/api', '').replace(/\/$/, '');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const formDataUpload = new FormData();
                formDataUpload.append('file', file);

                setMessage(lang === 'ta' ? 'படம் பதிவேற்றப்படுகிறது...' : 'Uploading image...');

                const res = await api.post('patient/upload-avatar', formDataUpload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const newAvatarUrl = res.data.url;

                // Update local states
                setUserProfile((prev: any) => ({ ...prev, avatar_url: newAvatarUrl }));

                setMessage(lang === 'ta' ? 'சுயவிவரப் படம் புதுப்பிக்கப்பட்டது!' : 'Profile picture updated!');
                setTimeout(() => setMessage(''), 3000);
            } catch (err) {
                console.error("Failed to upload avatar", err);
                setMessage(lang === 'ta' ? 'பதிவேற்றம் தோல்வியடைந்தது' : 'Upload failed');
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await api.put('patient/profile', formData);
            setMessage(lang === 'ta' ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'Profile updated successfully!');
            // Update local userProfile if name changed
            setUserProfile((prev: any) => ({ ...prev, name: formData.name }));
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            console.error("Failed to save profile", err);
            alert("Error saving profile: " + (err.response?.data?.detail || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title={t.profileTitle}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={t.profileTitle}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">{t.profileTitle}</h2>
                    <p className="text-slate-500 font-medium tracking-tight italic">{t.profileDesc}</p>
                </div>

                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        {message}
                    </motion.div>
                )}

                <div className="bg-white border text-center md:text-left border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                        <div className="relative group/avatar">
                            <label className="cursor-pointer block">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-full flex flex-col items-center justify-center text-5xl font-black ring-4 ring-white shadow-xl overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <img
                                            src={`${BACKEND_ROOT}${userProfile.avatar_url}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        formData.name ? formData.name.charAt(0).toUpperCase() : 'P'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-blue-900/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                    <UploadCloud className="w-8 h-8 text-white" />
                                </div>
                            </label>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">{formData.name || (lang === 'ta' ? 'உங்கள் பெயரை அமைக்கவும்' : 'Set your name')}</h3>
                            <p className="text-slate-500 font-medium mt-1">{userProfile?.email || 'No email set'}</p>
                            <div className="flex gap-2 mt-3 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">{lang === 'ta' ? 'முதன்மை உறுப்பினர்' : 'Primary Member'}</span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">{lang === 'ta' ? 'அடையாளம் சரிபார்க்கப்பட்டது' : 'Identity Verified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-blue-500" /> {t.legalName}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" /> {lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                            </label>
                            <input id="email" name="email" type="email" disabled className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl p-4 text-slate-500 font-bold cursor-not-allowed" defaultValue={userProfile?.email || ''} />
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="phone" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-500" /> {t.phoneNumber}
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder="+91 00000 00000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="address" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" /> {t.homeAddress}
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                autoComplete="street-address"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder={lang === 'ta' ? "கதவு எண், தெரு பெயர், சென்னை" : "123 Health Ave, Chennai"}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="age" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                Age (Years)
                            </label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder="e.g., 25"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="gender" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="blood_group" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                Blood Group
                            </label>
                            <select
                                id="blood_group"
                                name="blood_group"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none"
                                value={formData.blood_group}
                                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="weight" className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                Weight (kg)
                            </label>
                            <input
                                id="weight"
                                name="weight"
                                type="text"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder="e.g., 65"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                        >
                            {lang === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {t.saveChanges}
                        </button>
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
}
