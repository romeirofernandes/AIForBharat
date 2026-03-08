import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllIssues, updateIssueStatus, getIssueTimeline } from '../../api/issues';
import IssueTimeline from '../../components/IssueTimeline';
import { toast } from 'sonner';
import {
    FilterIcon,
    Sorting01Icon,
    Calendar01Icon,
    FlashIcon,
    ThumbsUpIcon,
    Message01Icon,
    AlertCircleIcon,
    ArrowUp01Icon,
    ArrowDown01Icon,
    Clock01Icon
} from 'hugeicons-react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MiniMap({ lat, lng }) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={true}
            zoomControl={true}
            dragging={true}
            attributionControl={false}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} />
        </MapContainer>
    );
}

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusColors = {
    pending: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200/50',
    in_progress: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200/50',
    resolved: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200/50',
    rejected: 'bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200/50',
};

const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
};

const allStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest', icon: Calendar01Icon },
    { value: 'priority', label: 'Priority', icon: FlashIcon },
    { value: 'mostVotes', label: 'Most Votes', icon: ThumbsUpIcon },
];

function PriorityBadge({ score }) {
    if (score == null) return null;
    const s = Math.round(score);
    let color = 'bg-muted text-muted-foreground border-border/50';
    if (s >= 50) color = 'bg-amber-100 text-amber-700 border-amber-200';
    if (s >= 120) color = 'bg-orange-100 text-orange-700 border-orange-200';
    if (s >= 250) color = 'bg-red-100 text-red-700 border-red-200';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border shadow-sm ${color}`}>
            <FlashIcon size={10} variant="solid" /> {s}
        </span>
    );
}

export default function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('newest');
    const [expandedId, setExpandedId] = useState(null);

    const [timelineIssueId, setTimelineIssueId] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const fetchIssues = () => {
        setLoading(true);
        getAllIssues(filter || undefined, sort === 'newest' ? undefined : sort)
            .then((data) => setIssues(data.issues))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchIssues(); }, [filter, sort]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateIssueStatus(id, newStatus);
            toast.success(`Status updated to ${statusLabels[newStatus]}`);
            fetchIssues();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const openTimeline = async (issueId) => {
        setTimelineIssueId(issueId);
        setTimeline([]);
        setTimelineLoading(true);
        try {
            const data = await getIssueTimeline(issueId);
            setTimeline(data.timeline);
        } catch {
            toast.error('Failed to load timeline');
        } finally {
            setTimelineLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-[0.05em] text-foreground flex items-center gap-3">
                    <FilterIcon size={28} className="text-primary" />
                    Issue Queue
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                    <AlertCircleIcon size={12} /> Manage citizen grievances
                </p>
            </motion.div>

            {/* Controls */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium mr-1">Status:</span>
                    <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${!filter ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>All</button>
                    {allStatuses.map((s) => (
                        <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                            {statusLabels[s]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center bg-muted/30 border border-border/50 rounded-xl p-1.5 gap-1.5 overflow-x-auto scrollbar-hide">
                    <span className="text-xs text-muted-foreground font-medium px-2">Sort:</span>
                    {SORT_OPTIONS.map((o) => (
                        <button
                            key={o.value}
                            onClick={() => setSort(o.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${sort === o.value ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <o.icon size={12} variant={sort === o.value ? 'solid' : 'linear'} className={sort === o.value ? 'text-primary' : ''} />
                            {o.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Timeline drawer */}
            <AnimatePresence>
                {timelineIssueId && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="border border-border/60 bg-muted/10 rounded-2xl p-6 mb-4">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm font-medium text-primary flex items-center gap-2">
                                    <Clock01Icon size={14} variant="solid" />
                                    Issue Timeline — #{timelineIssueId}
                                </p>
                                <button onClick={() => setTimelineIssueId(null)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                    ✕
                                </button>
                            </div>
                            <IssueTimeline timeline={timeline} loading={timelineLoading} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Issue list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-muted rounded-full opacity-20" />
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            ) : issues.length === 0 ? (
                <div className="border border-dashed border-border rounded-2xl p-32 bg-card text-center flex flex-col items-center justify-center">
                    <AlertCircleIcon size={48} className="text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">Queue clear — no issues found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issues.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ delay: i * 0.03 }}
                            className="border border-border rounded-lg bg-card hover:border-primary/20 transition-all overflow-hidden flex flex-col"
                        >
                            {/* Media: photo + map side by side at top */}
                            {(issue.imageUrl || (issue.latitude && issue.longitude)) && (
                                <div className={`grid ${issue.imageUrl && issue.latitude ? 'grid-cols-2' : 'grid-cols-1'} border-b border-border`}>
                                    {issue.imageUrl && (
                                        <div className={`aspect-video overflow-hidden bg-muted ${issue.imageUrl && issue.latitude ? 'border-r border-border' : ''}`}>
                                            <img
                                                src={issue.imageUrl}
                                                alt="Issue evidence"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {issue.latitude && issue.longitude && (
                                        <div className="aspect-video overflow-hidden">
                                            <MiniMap lat={Number(issue.latitude)} lng={Number(issue.longitude)} />
                                        </div>
                                    )}
                                </div>
                            )}
                            {issue.videoUrl && !issue.imageUrl && (
                                <div className="aspect-video overflow-hidden border-b border-border bg-muted">
                                    <video
                                        src={issue.videoUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                        playsInline
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="p-4 flex-1 flex flex-col gap-2 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground leading-snug">{issue.title}</h3>
                                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                                            by {issue.user?.email} 
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${statusColors[issue.status]}`}>
                                        {statusLabels[issue.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">{issue.description}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground/60 mt-auto">
                                    {issue.latitude && issue.longitude ? (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {Number(issue.latitude).toFixed(4)}, {Number(issue.longitude).toFixed(4)}
                                        </span>
                                    ) : <span />}
                                    <span>{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedId === issue.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-2 border-t border-border/50 space-y-6 bg-muted/5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-2">
                                                        <Clock01Icon size={12} /> Change Status
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {allStatuses.map((s) => (
                                                            <button key={s} onClick={() => handleStatusChange(issue.id, s)} disabled={issue.status === s}
                                                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border disabled:opacity-30 disabled:grayscale ${statusColors[s]} hover:scale-[1.02] active:scale-[0.98]`}>
                                                                {statusLabels[s]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-end">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openTimeline(issue.id); }}
                                                        className="h-10 inline-flex items-center justify-center gap-2 px-6 rounded-lg bg-primary text-primary-foreground border border-primary text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/10 active:scale-[0.98]"
                                                    >
                                                        <Clock01Icon size={14} variant="solid" />
                                                        Launch Timeline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* Expanded: status controls */}
                            {expandedId === issue.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground font-medium mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {allStatuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(issue.id, s)}
                                                disabled={issue.status === s}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${statusColors[s]}`}
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
