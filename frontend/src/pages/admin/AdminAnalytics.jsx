import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats } from '../../api/issues';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminAnalytics() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getStats()
            .then((data) => setStats(data.stats))
            .catch(() => { });
    }, []);

    const total = stats?.totalIssues || 1;
    const bars = [
        { label: 'Pending', value: stats?.pendingIssues ?? 0, color: 'bg-amber-500' },
        { label: 'Resolved', value: stats?.resolvedIssues ?? 0, color: 'bg-emerald-500' },
        { label: 'Other', value: Math.max(0, (stats?.totalIssues ?? 0) - (stats?.pendingIssues ?? 0) - (stats?.resolvedIssues ?? 0)), color: 'bg-blue-500' },
    ];

    return (
        <div className="w-full space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Analytics</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">System performance metrics</p>
            </motion.div>

            {/* Simple Bar Chart */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }} className="border border-border rounded-lg p-6 md:p-8 bg-card">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Issue Distribution</h3>
                <div className="space-y-5">
                    {bars.map((bar) => (
                        <div key={bar.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{bar.label}</span>
                                <span className="text-sm font-bold text-foreground">{bar.value}</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((bar.value / total) * 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className={`h-full rounded-full ${bar.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }} className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Resolution Rate</h3>
                    <p className="text-4xl font-bold text-chart-2">
                        {stats?.totalIssues ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%
                    </p>
                </motion.div>
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }} className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Active Backlog</h3>
                    <p className="text-4xl font-bold text-chart-5">{stats?.pendingIssues ?? 0}</p>
                </motion.div>
            </div>
        </div>
    );
}
