import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/auth';
import { toast } from 'sonner';
import {
    MessageSquare, AlertTriangle, CheckCircle2, RefreshCw, MessageCircle, FileText, 
    ListTodo, Car, LogOut, Terminal, Info, ExternalLink, ShieldCheck
} from 'lucide-react';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const BOT_NUMBER = '+1 (415) 523-8886';
const BOT_WA_LINK = 'https://wa.me/14155238886';

export default function WhatsAppPage() {
    const { user, login } = useAuth();
    const whatsappUser = user?.whatsappUser || null;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefreshStatus = async () => {
        setIsRefreshing(true);
        try {
            const profileData = await getProfile();
            login(localStorage.getItem('token'), profileData.user);
            toast.success('Status refreshed successfully');
        } catch {
            toast.error('Failed to refresh status');
        } finally {
            setIsRefreshing(false);
        }
    };

    const commands = [
        { cmd: '/login', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, desc: 'Start the login flow (email → OTP)' },
        { cmd: '/report', icon: <FileText className="w-4 h-4 text-blue-500" />, desc: 'Report a civic incident (text, photo, video, voice)' },
        { cmd: '/myissues', icon: <ListTodo className="w-4 h-4 text-purple-500" />, desc: 'View your last 5 reported issues & status' },
        { cmd: '/challans', icon: <Car className="w-4 h-4 text-amber-500" />, desc: 'View your last 5 unpaid traffic challans' },
        { cmd: '/logout', icon: <LogOut className="w-4 h-4 text-zinc-500" />, desc: 'Log out from WhatsApp' },
    ];

    const steps = [
        {
            step: '1',
            title: 'Join Twilio Sandbox',
            desc: `Open WhatsApp and message the bot. Send the join code from your Twilio Sandbox console (e.g. "join word-word"). This is a one-time step.`
        },
        {
            step: '2',
            title: 'Generate OTP',
            desc: 'Go to your Profile page → WhatsApp section. Enter your mobile number and click "Generate OTP". Note the 6-digit code.'
        },
        {
            step: '3',
            title: 'Send /login',
            desc: 'Open WhatsApp and send /login to the bot.'
        },
        {
            step: '4',
            title: 'Enter Email',
            desc: 'The bot will ask for your email. Send your registered email address.'
        },
        {
            step: '5',
            title: 'Enter OTP',
            desc: 'The bot will ask for your OTP. Send the 6-digit code from step 2.'
        },
    ];

    return (
        <div className="w-full space-y-8 pb-10">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">WhatsApp Bot</h1>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium max-w-2xl">
                        Connect with Civic Intel directly through WhatsApp to report incidents, track your issues, and manage traffic challans on the go.
                    </p>
                </div>
                
                <a
                    href={BOT_WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-sm shadow-green-500/20 active:scale-[0.98] shrink-0"
                >
                    <MessageCircle className="w-4 h-4" />
                    Open in WhatsApp
                </a>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ─── LEFT COLUMN ─── */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Status Card */}
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }} className="border border-border rounded-2xl bg-card overflow-hidden">
                        <div className="p-5 border-b border-border bg-muted/20 flex flex-col items-center justify-center text-center py-8">
                            <div className="relative mb-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${whatsappUser?.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center ${whatsappUser?.isActive ? 'bg-green-500' : 'bg-zinc-400'}`}>
                                    {whatsappUser?.isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                            </div>
                            
                            <h2 className="text-lg font-bold text-foreground mb-1">
                                {whatsappUser?.isActive ? 'Connected' : 'Not Connected'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {whatsappUser?.isActive 
                                    ? `Linked to ${whatsappUser.chatId?.replace('whatsapp:', '') || 'your number'}`
                                    : 'Link your WhatsApp account to get started'}
                            </p>
                        </div>
                        
                        <div className="p-4 flex items-center justify-between bg-card">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bot Number</p>
                                    <p className="text-sm font-mono font-bold text-foreground">{BOT_NUMBER}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleRefreshStatus}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </motion.div>

                    {/* Commands Card */}
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }} className="border border-border rounded-2xl p-6 bg-card">
                        <div className="flex items-center gap-2 mb-6">
                            <Terminal className="w-5 h-5 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Available Commands</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {commands.map((item) => (
                                <div key={item.cmd} className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <code className="text-xs font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {item.cmd}
                                        </code>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* ─── RIGHT COLUMN ─── */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Setup Guide */}
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }} className="border border-border rounded-2xl p-6 md:p-8 bg-card h-full">
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <Info className="w-5 h-5" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">How To Connect</h2>
                        </div>

                        {/* Sandbox Warning */}
                        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Sandbox Mode — First Time Setup</p>
                                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                    Civic Intel uses a Twilio Sandbox number. You must send a one-time join code from your 
                                    {' '}<a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1">Twilio Sandbox Console <ExternalLink className="w-3 h-3" /></a>{' '}
                                    to opt-in before you can use any commands.
                                </p>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {steps.map((item, index) => (
                                <div key={item.step} className="relative flex items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    
                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-card bg-primary text-primary-foreground font-bold text-xs shadow-sm z-10 shrink-0 md:order-1 md:group-odd:-ml-4 md:group-even:-mr-4 md:mx-auto ml-0 mr-4">
                                        {item.step}
                                    </div>
                                    
                                    {/* Content Card */}
                                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-muted/30 border border-border rounded-xl p-4 transition-all hover:bg-muted/60">
                                        <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
