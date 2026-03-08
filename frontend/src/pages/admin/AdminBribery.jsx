import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    SecurityCheckIcon as BadgeIcon,
    Calendar03Icon as CalendarIcon,
    Location04Icon as LocationIcon,
    MoneyReceiveSquareIcon as MoneyIcon,
    Image01Icon as ImageIcon,
    Video01Icon as VideoIcon,
    Alert02Icon as AlertIcon,
    InformationCircleIcon as InfoIcon,
    UserCircleIcon as UserIcon,
} from 'hugeicons-react';
import { RichButton } from '../../components/ui/rich-button';
import { getAllBriberyComplaints, updateBriberyStatus } from '../../api/bribery';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusConfig = {
    submitted: { label: 'Submitted', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    under_review: { label: 'Under Review', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    action_taken: { label: 'Action Taken', class: 'bg-purple-100 text-purple-700 border-purple-200' },
    resolved: { label: 'Resolved', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    dismissed: { label: 'Dismissed', class: 'bg-red-100 text-red-700 border-red-200' },
};

const allStatuses = ['submitted', 'under_review', 'action_taken', 'resolved', 'dismissed'];
const allFilters = ['', ...allStatuses];
const filterLabels = { '': 'All', submitted: 'Submitted', under_review: 'Under Review', action_taken: 'Action Taken', resolved: 'Resolved', dismissed: 'Dismissed' };

export default function AdminBribery() {
    const [complaints, setComplaints] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [adminNotes, setAdminNotes] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const [updating, setUpdating] = useState(null);

    const fetchComplaints = () => {
        setLoading(true);
        getAllBriberyComplaints(filter || undefined)
            .then((data) => {
                setComplaints(data.complaints || []);
                setSummary(data.summary || {});
            })
            .catch(() => toast.error('Failed to load complaints'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchComplaints(); }, [filter]);

    const handleStatusChange = async (id) => {
        const newStatus = selectedStatuses[id];
        const note = adminNotes[id];

        if (!newStatus) {
            toast.error('Select a status');
            return;
        }
        if (!note || note.trim().length === 0) {
            toast.error('Admin note is required');
            return;
        }

        setUpdating(id);
        try {
            await updateBriberyStatus(id, newStatus, note.trim());
            toast.success(`Complaint #${id} updated to ${filterLabels[newStatus]}`);
            setAdminNotes((prev) => ({ ...prev, [id]: '' }));
            setSelectedStatuses((prev) => ({ ...prev, [id]: '' }));
            fetchComplaints();
        } catch (err) {
            toast.error(err.message || 'Failed to update');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Misconduct Reports</h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium mt-1">Review and manage bribery / police misconduct complaints</p>
            </motion.div>

            {/* Summary Stats */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }}>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: summary.total || 0, color: 'text-foreground', bg: 'bg-muted/50' },
                        { label: 'Submitted', value: summary.submitted || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Reviewing', value: summary.under_review || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Action', value: summary.action_taken || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Resolved', value: summary.resolved || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Dismissed', value: summary.dismissed || 0, color: 'text-red-600', bg: 'bg-red-50' },
                    ].map((s) => (
                        <div key={s.label} className={`border border-border rounded-xl p-3 text-center ${s.bg}`}>
                            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">{s.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                <div className="flex flex-wrap gap-2">
                    {allFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Complaints List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : complaints.length === 0 ? (
                <div className="border border-border rounded-xl p-12 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">No misconduct reports found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map((c, i) => {
                        const sc = statusConfig[c.status] || statusConfig.submitted;
                        const isExpanded = expandedId === c.id;
                        const userName = c.user?.profile?.name || c.user?.email || 'Unknown';

                        return (
                            <motion.div
                                key={c.id}
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                transition={{ delay: i * 0.03 }}
                                className="border border-border rounded-xl bg-card hover:border-primary/20 transition-all overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold font-mono tracking-wider text-foreground">#{c.id}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${sc.class}`}>{sc.label}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                {c.complaintType === 'Other' ? c.otherComplaintType || 'Other' : c.complaintType}
                                            </h3>
                                            <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                                                <UserIcon size={11} /> {userName} • {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                                            <span className="flex items-center gap-1"><BadgeIcon size={12} /> {c.badgeNumber}</span>
                                            {c.amountDemanded && <span className="flex items-center gap-1 text-red-600"><MoneyIcon size={12} /> ₹{c.amountDemanded.toLocaleString('en-IN')}</span>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium line-clamp-2">{c.description}</p>
                                </div>

                                {/* Expanded Detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border/50"
                                        >
                                            <div className="p-5 space-y-4">
                                                {/* Full Description */}
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Full Description</p>
                                                    <p className="text-xs text-foreground font-medium leading-relaxed">{c.description}</p>
                                                </div>

                                                {/* Details */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Badge #</p>
                                                        <p className="text-xs font-mono font-bold text-foreground">{c.badgeNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Incident</p>
                                                        <p className="text-xs font-medium text-foreground">
                                                            {new Date(c.incidentAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {c.location && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Location</p>
                                                            <p className="text-xs font-medium text-foreground">{c.location}</p>
                                                        </div>
                                                    )}
                                                    {c.challanNumber && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Challan #</p>
                                                            <p className="text-xs font-mono font-medium text-foreground">{c.challanNumber}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Media */}
                                                {c.mediaUrls && c.mediaUrls.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">Evidence</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {c.mediaUrls.map((url, j) => {
                                                                const isVideo = url.match(/\.(mp4|webm|mov|avi)/i);
                                                                return (
                                                                    <a
                                                                        key={j}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-xs font-medium text-primary\"
                                                                    >
                                                                        {isVideo ? <VideoIcon size={12} /> : <ImageIcon size={12} />}
                                                                        {isVideo ? 'Video' : 'Photo'} {j + 1}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Current Admin Note */}
                                                {c.adminNote && (
                                                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                                                        <p className="text-xs font-medium text-amber-700 mb-1">Current Admin Note</p>
                                                        <p className="text-xs text-amber-800 font-medium">{c.adminNote}</p>
                                                    </div>
                                                )}

                                                {/* Status Update Panel */}
                                                <div className="border-t border-border/50 pt-4 space-y-3">
                                                    <p className="text-xs text-muted-foreground font-medium">Update Status</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {allStatuses.map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedStatuses((prev) => ({ ...prev, [c.id]: s }));
                                                                }}
                                                                disabled={c.status === s}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${selectedStatuses[c.id] === s
                                                                        ? 'ring-2 ring-primary ring-offset-1'
                                                                        : ''
                                                                    } ${statusConfig[s]?.class || ''}`}
                                                            >
                                                                {filterLabels[s]}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <textarea
                                                        rows={3}
                                                        placeholder="Reason for this status change (visible to complainant)…"
                                                        value={adminNotes[c.id] || ''}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setAdminNotes((prev) => ({ ...prev, [c.id]: e.target.value }));
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                                    />

                                                    <RichButton
                                                        color="primary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(c.id);
                                                        }}
                                                        disabled={
                                                            updating === c.id ||
                                                            !selectedStatuses[c.id] ||
                                                            !adminNotes[c.id]?.trim() ||
                                                            c.status === selectedStatuses[c.id]
                                                        }
                                                        className="font-bold uppercase tracking-wider text-xs"
                                                    >
                                                        {updating === c.id ? 'Updating…' : 'Update Status'}
                                                    </RichButton>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
