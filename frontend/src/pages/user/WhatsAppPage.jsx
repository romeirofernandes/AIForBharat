import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/auth';
import { toast } from 'sonner';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const BOT_NUMBER = '+1 (859) 927-6910';
const BOT_WA_LINK = 'https://wa.me/18599276910';

export default function WhatsAppPage() {
    const { user, login } = useAuth();
    const whatsappUser = user?.whatsappUser || null;

    const handleRefreshStatus = async () => {
        try {
            const profileData = await getProfile();
            login(localStorage.getItem('token'), profileData.user);
            toast.success('Status refreshed');
        } catch {
            toast.error('Failed to refresh status');
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">WhatsApp Bot</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Connect your account to our WhatsApp bot for quick access to services</p>
            </motion.div>

            {/* Status Card — remove old standalone status */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Open WhatsApp card */}
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
                    className="border border-border rounded-lg p-6 bg-card space-y-5 flex flex-col"
                >
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Open WhatsApp Bot</h2>
                        <p className="text-xs text-muted-foreground mt-1">Click below to open a chat with the bot directly in WhatsApp</p>
                    </div>

                    {/* Big open button */}
                    <a
                        href={BOT_WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                        Open in WhatsApp
                    </a>

                    {/* Sandbox notice */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-medium text-amber-600">⚠️ Sandbox — First-time setup required</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Twilio Sandbox numbers need a one-time opt-in. Open WhatsApp, chat with <span className="font-mono font-bold text-foreground">{BOT_NUMBER}</span>, and send the join code shown in your
                            {' '}<a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Twilio Sandbox console</a>{' '}
                            (e.g. <code className="bg-muted/60 px-1 rounded">join word-word</code>). After that, /login and all commands will work.
                        </p>
                    </div>

                    <div className="mt-auto border-t border-border pt-5 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Your Status</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${whatsappUser?.isActive ? 'bg-green-500' : 'bg-zinc-400'}`} />
                                <span className="text-xs font-medium text-foreground">
                                    {whatsappUser?.isActive
                                        ? `Connected • ${whatsappUser.chatId?.replace('whatsapp:', '') || ''}`
                                        : 'Not connected'}
                                </span>
                            </div>
                            <button
                                onClick={handleRefreshStatus}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Documentation */}
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }}
                    className="border border-border rounded-lg p-6 bg-card space-y-5"
                >
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">How It Works</h2>
                        <p className="text-xs text-muted-foreground mt-1">Step-by-step guide to connect your WhatsApp</p>
                    </div>

                    {/* Bot Number */}
                    <div className="bg-muted/40 border border-border rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Bot Number</p>
                            <p className="text-sm font-mono font-bold text-foreground">{BOT_NUMBER}</p>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        {[
                            {
                                step: '1',
                                title: 'Join Twilio Sandbox',
                                desc: `Open WhatsApp and message ${BOT_NUMBER}. Send the join code from your Twilio Sandbox console (e.g. "join word-word"). This is a one-time step.`
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
                        ].map((item) => (
                            <div key={item.step} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">{item.title}</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Commands */}
                    <div className="border-t border-border pt-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Available Commands</p>
                        <div className="space-y-2">
                            {[
                                { cmd: '/login', desc: 'Start the login flow (email → OTP)' },
                                { cmd: '/challans', desc: 'View your last 5 unpaid traffic challans' },
                                { cmd: '/logout', desc: 'Log out from WhatsApp' },
                            ].map((item) => (
                                <div key={item.cmd} className="flex items-start gap-2">
                                    <code className="px-2 py-0.5 bg-muted/60 border border-border rounded text-xs font-mono font-bold text-foreground shrink-0">
                                        {item.cmd}
                                    </code>
                                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
