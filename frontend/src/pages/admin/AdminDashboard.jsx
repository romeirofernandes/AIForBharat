import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats, getAllIssues } from '../../api/issues';
import {
    Alert02Icon,
    TaskDone01Icon,
    UserMultiple02Icon,
    Loading03Icon,
    Home01Icon,
    Clock01Icon,
    FlashIcon,
} from 'hugeicons-react';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentIssues, setRecentIssues] = useState([]);

    useEffect(() => {
        getStats()
            .then((data) => setStats(data.stats))
            .catch(() => {});
        getAllIssues()
            .then((data) => setRecentIssues((data.issues || []).slice(0, 5)))
            .catch(() => {});
    }, []);

    const cards = [
        { title: 'Total Issues', value: stats?.totalIssues ?? '-', icon: Alert02Icon, color: 'text-foreground', bg: 'bg-muted/50' },
        { title: 'Pending', value: stats?.pendingIssues ?? '-', icon: Loading03Icon, color: 'text-amber-600', bg: 'bg-amber-100/50' },
        { title: 'Resolved', value: stats?.resolvedIssues ?? '-', icon: TaskDone01Icon, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
        { title: 'Registered Users', value: stats?.totalUsers ?? '-', icon: UserMultiple02Icon, color: 'text-blue-600', bg: 'bg-blue-100/50' },
    ];

    const statusColors = {
        pending: 'bg-amber-100/80 text-amber-700',
        in_progress: 'bg-blue-100/80 text-blue-700',
        resolved: 'bg-emerald-100/80 text-emerald-700',
        rejected: 'bg-red-100/80 text-red-700',
    };

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                    <Home01Icon size={28} className="text-primary" />
                    Dashboard
                </h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] mt-1.5 ml-1">
                    Civic Intelligence system overview
                </p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border border-border/60 rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                            <card.icon size={18} className={card.color} />
                        </div>
                        <p className={`text-3xl font-black tabular-nums ${card.color}`}>{card.value}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{card.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }}
                className="border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                    <Clock01Icon size={14} className="text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Reports</p>
                </div>
                {recentIssues.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-xs text-muted-foreground font-medium">No recent activity</p>
                    </div>
                ) : (
                    <div>
                        {recentIssues.map((issue, i) => (
                            <motion.div key={issue.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.03 }}
                                className="px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{issue.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {issue.user?.email} &middot; {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                {issue.priorityScore != null && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-muted text-muted-foreground">
                                        <FlashIcon size={10} /> {Math.round(issue.priorityScore)}
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full shrink-0 ${statusColors[issue.status] || 'bg-muted text-muted-foreground'}`}>
                                    {issue.status?.replace('_', ' ')}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
