import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyIssues } from '../../api/issues';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
};

export default function MyComplaints() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyIssues()
            .then((data) => setIssues(data.issues))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">My Complaints</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Track the status of your reported grievances</p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : issues.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="border border-border rounded-lg p-12 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">No complaints yet. Report an issue to get started!</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {issues.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ delay: i * 0.05 }}
                            className="border border-border rounded-lg p-5 bg-card hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{issue.title}</h3>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${statusColors[issue.status]}`}>
                                    {statusLabels[issue.status]}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mb-3 line-clamp-2">{issue.description}</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                                {issue.location && <span>📍 {issue.location}</span>}
                                <span>{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
