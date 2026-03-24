'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { X, Send, User, Bot, Paperclip, MoreHorizontal, MessageSquare, ShieldAlert } from 'lucide-react';

interface LiveChatOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export default function LiveChatOverlay({ isOpen, onClose, lang }: LiveChatOverlayProps) {
    const [messages, setMessages] = React.useState([
        { id: 1, role: 'bot', text: 'Hello! I am AuraHealth Clinic AI. How can I assist you with your health journey today?', time: 'Just now' },
        { id: 2, role: 'bot', text: 'You can ask about scheduling specialists, finding records, or our AI tools.', time: 'Just now' }
    ]);
    const [inputValue, setInputValue] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'user',
                text: `📎 Attached: ${file.name}`,
                time: 'Now'
            }]);

            // Simulation bot acknowledgement
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'bot',
                    text: `I've successfully received your file: ${file.name}. Our specialists will review these clinical documents before your next consultation.`,
                    time: 'Now'
                }]);
            }, 1200);
        }
    };

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        const newMessage = { id: Date.now(), role: 'user', text, time: 'Now' };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        const textLower = text.toLowerCase();
        
        // Instant Local Responses
        const localResponses: Record<string, string> = {
            'hi': 'Hello! How can I help you today with your healthcare needs?',
            'hello': 'Hi there! I am AuraHealth’s clinical AI. What can I do for you?',
            'hey': 'Hey! How are you feeling today?',
            'help': 'I can help you find specialists, guide you through symptom analysis, or answer platform questions.'
        };

        if (localResponses[textLower]) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'bot',
                    text: localResponses[textLower],
                    time: 'Now'
                }]);
            }, 100);
            return;
        }

        setIsTyping(true);
        try {
            const res = await api.post('/patient/chat', { message: text });
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: res.data.message,
                time: 'Now'
            }]);
        } catch (err: any) {
            console.error("Chat failed", err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: "I'm sorry, I'm experiencing a minor lag in our clinical cloud. Please try again or book a doctor directly if you need urgent care.",
                time: 'Now'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-end justify-end p-2 md:p-8 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 40 }}
                    className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full md:max-w-md h-[90vh] md:h-[600px] border border-slate-100 flex flex-col pointer-events-auto overflow-hidden ring-1 ring-slate-200/50"
                >
                    {/* Header */}
                    <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold">HealthAI Support</h3>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">Always Online</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/30"
                    >
                        {messages.map((msg) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                            >
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] space-y-1`}>
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <p className={`text-[10px] uppercase tracking-tighter font-bold text-slate-400 ${msg.role === 'user' ? 'text-right mr-2' : 'ml-2'
                                        }`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-slate-100">
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl p-2 px-4 focus-within:border-primary focus-within:bg-white transition-all shadow-inner"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={handleFileClick}
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent py-2 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
