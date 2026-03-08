import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getMyIssues } from '../../api/issues';
import { useNavigate } from 'react-router-dom';
import {
    Alert02Icon as Report,
    TaskDone01Icon as Complaints,
    ArrowRight01Icon as ArrowRight,
} from 'hugeicons-react';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [issueCount, setIssueCount] = useState(0);
    const [resolvedCount, setResolvedCount] = useState(0);

    useEffect(() => {
        getMyIssues().then((data) => {
            setIssueCount(data.issues.length);
            setResolvedCount(data.issues.filter(i => i.status === 'resolved').length);
        }).catch(() => { });
    }, []);

    const cards = [
        { title: 'Active Complaints', value: issueCount - resolvedCount, desc: 'Pending grievances', icon: Report, color: 'text-chart-5', bg: 'bg-chart-5/10', link: '/user/complaints' },
        { title: 'Resolved', value: resolvedCount, desc: 'Complaints resolved', icon: Complaints, color: 'text-chart-1', bg: 'bg-chart-1/10', link: '/user/complaints' },
    ];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="w-full space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">
                    {greeting}, Citizen
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">{user?.email}</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(card.link)}
                        className="group border border-border rounded-lg p-6 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon size={22} className={card.color} />
                            </div>
                            <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground mb-1">{card.value}</h3>
                        <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2 font-medium">{card.desc}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
                <div className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="text-xs font-medium text-muted-foreground mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/user/report')}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-left"
                        >
                            <Report size={20} className="text-primary" />
                            <div>
                                <p className="text-sm font-bold text-foreground">Report a Grievance</p>
                                <p className="text-xs text-muted-foreground">Submit a new civic complaint</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/user/complaints')}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-left"
                        >
                            <Complaints size={20} className="text-primary" />
                            <div>
                                <p className="text-sm font-bold text-foreground">My Complaints</p>
                                <p className="text-xs text-muted-foreground">Track your reported grievances</p>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
