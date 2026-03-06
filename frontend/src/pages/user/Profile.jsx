import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Profile</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Your civic identity</p>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ delay: 0.1 }}
                className="border border-border rounded-lg p-6 md:p-8 bg-card space-y-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase">
                        {user?.email?.[0]}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground">{user?.email}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{user?.role}</p>
                    </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Email</span>
                        <span className="text-sm font-medium text-foreground">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Role</span>
                        <span className="text-sm font-medium text-foreground capitalize">{user?.role}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Member Since</span>
                        <span className="text-sm font-medium text-foreground">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
