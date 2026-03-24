'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Activity,
  User,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  Mic,
  Search,
  BookOpen,
  ArrowRight,
  Plus,
  ArrowUpRight,
  LayoutDashboard,
  Brain,
  Video,
  Clock,
  Shield,
  Smartphone,
  CheckCircle,
  Menu,
  X,
  MessageSquare,
  Globe,
  Bell,
  Sparkles,
  Zap,
  BarChart2,
  Users,
  MousePointer2,
  Lock,
  ExternalLink,
  Calendar,
  Star,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cycle through workflow steps every 1.5 seconds for a snappy demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % workflowSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#problem' },
    { name: 'Login', href: '/login' },
    { name: 'Sign Up', href: '/register' }
  ];

  const modules = [
    {
      icon: <Brain className="w-8 h-8 text-[#2563EB]" />,
      title: "AI Analysis Module",
      description: "Advanced neural engine for real-time symptom analysis and diagnostic triage with high precision.",
      href: "/patient/dashboard"
    },
    {
      icon: <User className="w-8 h-8 text-[#06B6D4]" />,
      title: "Consultation Module",
      description: "Seamlessly connect with verified healthcare professionals through secure low-latency video and chat meshes.",
      href: "/doctor/dashboard"
    },
    {
      icon: <LayoutDashboard className="w-8 h-8 text-[#2563EB]" />,
      title: "Management Module",
      description: "Integrated dashboard for electronic health records, appointment scheduling, and clinical workflow optimization.",
      href: "/admin"
    },
    {
      icon: <Lock className="w-8 h-8 text-[#06B6D4]" />,
      title: "Authentication Module",
      description: "HIPAA-compliant multi-factor authentication system ensuring end-to-end security of sensitive patient data.",
      href: "/login"
    }
  ];

  const workflowSteps = [
    { title: "Login", icon: <User className="w-6 h-6" />, desc: "Secure access to health profile" },
    { title: "Enter Symptoms", icon: <Search className="w-6 h-6" />, desc: "Input physical indicators" },
    { title: "AI Processing", icon: <Brain className="w-6 h-6" />, desc: "Neural triage analysis" },
    { title: "Doctor Consult", icon: <Stethoscope className="w-6 h-6" />, desc: "Clinical interaction" },
    { title: "Admin Monitoring", icon: <ShieldCheck className="w-6 h-6" />, desc: "Global network oversight" }
  ];

  const devStatus = [
    { label: "UI Design Completed", status: "Completed", icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
    { label: "Authentication Implemented", status: "Completed", icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
    { label: "AI Module Basic", status: "Completed", icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
    { label: "Dashboard Ready", status: "Completed", icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
    { label: "Testing Phase Ongoing", status: "In Progress", icon: <Clock className="text-amber-500 w-5 h-5" />, progress: 75 }
  ];

  const techStack = [
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" }
  ];

  const futureScope = [
    { title: "Advanced AI", icon: <Brain className="w-6 h-6" />, desc: "Prescriptive diagnostics" },
    { title: "Video Consultation", icon: <Video className="w-6 h-6" />, desc: "HD clinical streaming" },
    { title: "Hospital Integration", icon: <LayoutDashboard className="w-6 h-6" />, desc: "Node synchronization" },
    { title: "Mobile App", icon: <Smartphone className="w-6 h-6" />, desc: "Native iOS & Android" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#2563EB]/20 tracking-tight font-sans">
      {/* 1. Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
          isScrolled 
            ? 'py-3 bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-xl shadow-slate-900/5' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-[#1E293B] tracking-tighter">HealthAI</span>
          </Link>

          <div className="hidden md:flex items-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2.5 px-6 py-2.5 bg-[#1E293B] hover:bg-[#2563EB] text-white rounded-xl text-[11px] font-black transition-all shadow-lg hover:-translate-y-0.5 uppercase tracking-widest group"
            >
              <LogIn className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              Login
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-[#1E293B]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-24 overflow-hidden bg-[#F8FAFC]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 text-slate-100">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-4xl md:text-6xl font-black text-[#1E293B] leading-[1] mb-6 tracking-tighter">
                AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">Healthcare</span> <br />
                Ecosystem
              </h1>
              <p className="text-[#64748B] text-lg font-medium leading-relaxed max-w-lg mb-10 opacity-90 italic">
                A mission-critical system designed for intelligent clinical analysis, real-time telemetry, and seamless doctor-patient synchronization.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link 
                  href="/register" 
                  className="group px-8 py-4 bg-[#1E293B] hover:bg-blue-600 text-white rounded-2xl text-[13px] font-black transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  GET STARTED <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#workflow" 
                  className="px-8 py-4 bg-white border border-slate-200 text-[#1E293B] hover:border-blue-500/50 rounded-2xl text-[13px] font-black transition-all shadow-sm hover:shadow-xl flex items-center justify-center gap-2"
                >
                  EXPLORE ARCHITECTURE <Search className="w-4 h-4" />
                </Link>
              </div>

              {/* Research Metrics */}
              <div className="mt-12 pt-6 border-t border-slate-100 grid grid-cols-3 gap-6">
                 <div>
                    <p className="text-xl font-black text-blue-600">99.8%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Model Accuracy</p>
                 </div>
                 <div>
                    <p className="text-xl font-black text-blue-600">40ms</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latency</p>
                 </div>
                 <div>
                    <p className="text-xl font-black text-blue-600">128-bit</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Encryption</p>
                 </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative lg:ml-auto max-w-[500px] flex flex-col justify-center"
            >
              {/* Refined Mockup with Glassmorphism */}
              <div className="relative z-10 bg-white/40 backdrop-blur-3xl rounded-[3.25rem] p-1 shadow-[0_32px_64px_-16px_rgba(30,41,59,0.15)] border border-white/60">
                <div className="bg-white rounded-[3rem] p-8 overflow-hidden shadow-inner relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Activity className="w-3.5 h-3.5" />
                       </div>
                       <p className="text-xs font-black text-[#1E293B] tracking-tight">Active Analysis</p>
                    </div>
                    <div className="flex gap-1 opacity-30">
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 group hover:bg-blue-600 transition-colors duration-500">
                      <Heart className="w-6 h-6 text-rose-500 mb-3 group-hover:text-white" />
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest group-hover:text-blue-100">Pulse</p>
                      <p className="text-2xl font-black text-[#1E293B] group-hover:text-white">72 <span className="text-[10px] opacity-40">Good</span></p>
                    </div>
                    <div className="p-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 group hover:bg-cyan-600 transition-colors duration-500">
                      <Zap className="w-6 h-6 text-cyan-500 mb-3 group-hover:text-white" />
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest group-hover:text-cyan-100">AI Logic</p>
                      <p className="text-2xl font-black text-[#1E293B] group-hover:text-white">Active</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-[1.75rem] bg-slate-900 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                           <Brain className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-white">Neural Bridge</p>
                           <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Streaming...</p>
                        </div>
                     </div>
                     <div className="px-3 py-1.5 bg-blue-600 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                        Live
                     </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Stats */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-8 bg-white/95 backdrop-blur-2xl px-5 py-4 rounded-3xl shadow-xl border border-white z-30 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AES-128</p>
                   <p className="text-xs font-black text-slate-900">Patient Privacy</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 bg-[#1E293B] px-6 py-4 rounded-[2rem] shadow-2xl z-30"
              >
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-2">
                      {[1, 2].map((i) => (
                        <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#1E293B] bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white`}>
                           {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">On-Call</p>
                      <p className="text-xs font-black text-white">Specialists</p>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 & 4. Why & What - Problem/Solution Grid */}
      <section id="problem" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Why This System? (Problem) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden p-10 pt-20 min-h-[520px] rounded-[3.5rem] bg-white text-[#1E293B] shadow-2xl group flex flex-col justify-end border border-slate-100"
            >
              {/* Background Watermark Icon */}
              <Activity className="absolute -top-12 -right-12 w-64 h-64 text-rose-500/10 rotate-12 -z-10 group-hover:scale-110 transition-transform duration-1000" />
              
              <Image 
                src="/images/problem_bg_light.png" 
                alt="Healthcare challenges" 
                fill 
                className="object-cover absolute inset-0 -z-20 opacity-40 group-hover:scale-110 transition-transform duration-[2s]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent -z-10"></div>
              
              <div className="relative z-10 w-full">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-10 text-white shadow-xl shadow-rose-500/20">
                  <AlertCircle className="w-9 h-9" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
                  Why This <br />
                  <span className="text-rose-500">System?</span>
                </h2>
                <p className="text-[#64748B] text-base font-medium leading-relaxed mb-10 max-w-sm opacity-90">
                  Modern healthcare faces critical delays. Long waiting times and accurate symptom tracking are no longer sustainable. We bridge that gap with immediate neural analysis.
                </p>
                <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-rose-500 rounded-full"></div>
                  <p className="text-sm font-bold text-rose-900/60 italic leading-relaxed">"Fragmented records and slow triage prevent timely clinical intervention. We are the remedy."</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: What it Provides (Solution) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden p-10 pt-20 min-h-[520px] rounded-[3.5rem] bg-white text-[#1E293B] shadow-2xl group flex flex-col justify-end border border-slate-100"
            >
              {/* Background Watermark Icon */}
              <Brain className="absolute -top-12 -right-12 w-64 h-64 text-amber-500/10 -rotate-12 -z-10 group-hover:scale-110 transition-transform duration-1000" />

              <Image 
                src="/images/solution_bg_light.png" 
                alt="Healthcare AI Solution" 
                fill 
                className="object-cover absolute inset-0 -z-20 opacity-40 group-hover:scale-110 transition-transform duration-[2s]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent -z-10"></div>
              
              <div className="relative z-10 w-full">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-10 text-white shadow-xl shadow-amber-500/20">
                  <Lightbulb className="w-9 h-9" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
                  What This Platform <br />
                  <span className="text-amber-500">Provides</span>
                </h2>
                <p className="text-[#64748B] text-base font-medium leading-relaxed mb-10 max-w-sm opacity-90">
                  A centralized ecosystem for neural symptom analysis, secure specialist video meshes, and HIPAA-compliant health data management.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Neural Triage", "Secure Meshes", "Data Ledger"].map((item) => (
                    <div key={item} className="px-5 py-2.5 bg-white rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#2563EB] shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Key Modules Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle decorative background text */}
        <div className="absolute top-0 right-0 text-[15rem] font-black text-slate-50 select-none -z-10 translate-x-1/2 -translate-y-1/4">CORE</div>
        
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border border-slate-100"
            >
              Structural Foundation
            </motion.div>
            <h2 className="text-4xl font-black text-[#1E293B] mb-6">Key <span className="text-blue-600">Modules</span></h2>
            <p className="text-sm text-[#64748B] font-medium opacity-60">The structural foundation of the HealthAI ecosystem built for mission-critical reliability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((module, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -15 }}
                className="relative p-10 rounded-[2.5rem] bg-[#F8FAFC] border border-slate-100 transition-all duration-500 group overflow-hidden"
              >
                {/* Hover Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                {/* Module Index */}
                <div className="absolute top-8 right-10 text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">0{idx + 1}</div>

                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:shadow-blue-500/30 group-hover:-rotate-6 transition-all duration-500">
                  <div className="group-hover:text-white transition-colors duration-500">
                    {module.icon}
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#1E293B] mb-4 tracking-tight group-hover:text-blue-600 transition-colors">{module.title}</h3>
                <p className="text-[11px] text-[#64748B] font-medium leading-relaxed opacity-80 italic group-hover:opacity-100 transition-opacity">
                  {module.description}
                </p>
                
                {/* Glassmorphism Overlay on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 backdrop-blur-[2px] transition-all -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. System Workflow Section */}
      <section id="workflow" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-blue-100"
             >
               Live Pipeline Simulation
             </motion.div>
             <h2 className="text-3xl md:text-6xl font-black text-[#1E293B] mb-8 tracking-tighter">How the System <span className="text-blue-600">Works</span></h2>
             <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] opacity-80">Cycle Progress: Step {currentStep + 1} of 5</p>
          </div>

          <div className="relative group/pipeline">
            {/* Animated Flowing Line */}
            <div className="hidden lg:block absolute top-[72px] left-0 w-full h-1 overflow-visible -z-10 px-[10%]">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M 0 2 H 1000"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  strokeDasharray="12 12"
                  fill="transparent"
                />
                <motion.path
                  d="M 0 2 H 1000"
                  stroke="#2563EB"
                  strokeWidth="3"
                  fill="transparent"
                  initial={{ strokeDasharray: "0 1000" }}
                  animate={{ strokeDasharray: [`${currentStep * 200} 1000`, `${(currentStep + 1) * 200} 1000`] }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
              {workflowSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  animate={{ 
                    scale: idx === currentStep ? 1.05 : 1,
                    borderColor: idx === currentStep ? "rgba(37,99,235,0.4)" : "rgba(241,245,249,0.8)"
                  }}
                  transition={{ duration: 0.4 }}
                  className={`relative p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-300 ${
                    idx === currentStep 
                      ? "bg-white border-2 shadow-[0_40px_80px_-25px_rgba(37,99,235,0.2)]" 
                      : "bg-white/50 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] opacity-60 grayscale-[0.5]"
                  }`}
                >
                  {/* Step Marker */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-xl border-4 border-[#F8FAFC] transition-all duration-300 ${
                    idx <= currentStep ? "bg-blue-600" : "bg-slate-300"
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Icon Container with Glow */}
                  <div className="relative mb-8">
                    {idx === currentStep && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl transition-all duration-500"
                      />
                    )}
                    <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-sm border ${
                      idx === currentStep 
                        ? "bg-blue-600 text-white rotate-[10deg] border-transparent" 
                        : "bg-slate-50 text-blue-600 border-slate-100"
                    }`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className={`text-[13px] font-black mb-3 uppercase tracking-widest transition-colors ${
                    idx === currentStep ? "text-blue-600" : "text-[#1E293B]"
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed mb-6">
                    {step.desc}
                  </p>
                  
                  {/* Action Indicator */}
                  <div className={`w-12 h-1 rounded-full mt-auto transition-all duration-700 ${
                    idx === currentStep ? "bg-blue-600 w-24" : "bg-slate-100"
                  }`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI Functionality Section */}
      <section className="py-24 bg-[#1E293B] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.2),transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] mb-12"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Role of <span className="text-blue-400">Artificial Intelligence</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium italic opacity-80 mb-16">
            The system integrates AI to process complex medical telemetry, categorize symptoms using NLP, and provide voice-enabled accessibility for users via a seamless cognitive bridge.
          </p>
          <div className="flex justify-center gap-12 text-blue-400">
             <div className="flex flex-col items-center gap-4">
                <Mic className="w-10 h-10 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Voice Analysis</span>
             </div>
             <div className="flex flex-col items-center gap-4">
                <Shield className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Neural Firewall</span>
             </div>
          </div>
        </div>
      </section>

      {/* 8. Development Status Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-black text-[#1E293B] mb-16 text-center tracking-tight">Development <span className="text-blue-600">Status</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devStatus.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-6 bg-[#F8FAFC] border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <div>
                        <h4 className="text-sm font-black text-[#1E293B]">{item.label}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.status}</p>
                      </div>
                    </div>
                    {item.progress && (
                       <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.progress}%` }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-blue-500"
                          />
                       </div>
                    )}
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 9. Technologies Used Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-6">
           <h2 className="text-3xl font-black text-[#1E293B] text-center mb-20 tracking-tight">Technologies <span className="text-blue-600">Used</span></h2>
           <div className="grid grid-cols-2 md:grid-cols-6 gap-8 grayscale hover:grayscale-0 transition-all duration-700">
              {techStack.map((tech) => (
                <motion.div 
                  key={tech.name}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <img src={tech.icon} alt={tech.name} className="w-12 h-12 object-contain" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tech.name}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 10. Future Enhancements Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-[#1E293B] text-center mb-16 tracking-tight">Future <span className="text-blue-600">Scope</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {futureScope.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-[#F8FAFC] border border-slate-100 rounded-3xl group hover:bg-[#1E293B] transition-all duration-500"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform shadow-md">
                      {item.icon}
                    </div>
                    <h4 className="text-sm font-black text-[#1E293B] group-hover:text-white mb-2 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 group-hover:text-slate-400 font-medium italic">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-slate-900 pt-24 pb-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(37,99,235,0.05),transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter">HealthAI</span>
              </Link>
              <p className="text-slate-500 text-sm font-medium leading-relaxed italic opacity-60">
                A graduation project showcasing the intersection of neural computation and modern clinical workflows.
              </p>
            </div>
            <div className="space-y-6">
              <h5 className="text-[11px] font-black uppercase text-blue-500 tracking-[0.3em]">Project Credentials</h5>
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400">Student: <span className="text-white">Gracy Sahayam</span></p>
                <p className="text-xs font-black text-slate-400">Institution: <span className="text-white">ABC Institute of Technology</span></p>
                <p className="text-xs font-black text-slate-400">Submission Code: <span className="text-white">FYP-2026-X1</span></p>
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="text-[11px] font-black uppercase text-blue-500 tracking-[0.3em]">Connect</h5>
              <div className="flex gap-6">
                <Link href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <Activity className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 HealthAI Systems. ALL ENDPOINTS SECURED.</p>
            <div className="flex items-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
               <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
               <Link href="#" className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[200] p-10 flex flex-col items-center justify-center text-center space-y-10"
          >
             <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10"><X className="w-8 h-8" /></button>
             {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black text-slate-900">{link.name}</Link>
             ))}
             <Link href="/register" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
