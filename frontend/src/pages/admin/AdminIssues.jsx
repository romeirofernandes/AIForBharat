import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllIssues, updateIssueStatus } from '../../api/issues';
import { toast } from 'sonner';

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

const allStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];

export default function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const fetchIssues = () => {
        setLoading(true);
        getAllIssues(filter || undefined)
            .then((data) => setIssues(data.issues))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchIssues(); }, [filter]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateIssueStatus(id, newStatus);
            toast.success(`Issue status updated to ${statusLabels[newStatus]}`);
            fetchIssues();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Issue Queue</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Manage and resolve citizen grievances</p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                    All
                </button>
                {allStatuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        {statusLabels[s]}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : issues.length === 0 ? (
                <div className="border border-border rounded-lg p-12 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">No issues found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {issues.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ delay: i * 0.03 }}
                            className="border border-border rounded-lg bg-card hover:border-primary/20 transition-all overflow-hidden"
                        >
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{issue.title}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mt-0.5">
                                            by {issue.user?.email} • {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0 ${statusColors[issue.status]}`}>
                                        {statusLabels[issue.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2">{issue.description}</p>
                                {issue.latitude && issue.longitude && (
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-2">{issue.latitude}, {issue.longitude}</p>
                                )}
                                {(issue.imageUrl || issue.videoUrl) && (
                                    <div className="flex gap-2 mt-3">
                                        {issue.imageUrl && (
                                            <a href={issue.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                View Image
                                            </a>
                                        )}
                                        {issue.videoUrl && (
                                            <a href={issue.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                View Video
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Expanded detail */}
                            {expandedId === issue.id && (
                                <div className="px-5 pb-5 pt-2 border-t border-border/50">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {allStatuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(issue.id, s)}
                                                disabled={issue.status === s}
                                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${statusColors[s]}`}
                                            >
                                                {statusLabels[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
