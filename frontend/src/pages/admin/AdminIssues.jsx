import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllIssues, updateIssueStatus } from '../../api/issues';
import { toast } from 'sonner';
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
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mt-0.5">
                                            by {issue.user?.email} 
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${statusColors[issue.status]}`}>
                                        {statusLabels[issue.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">{issue.description}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mt-auto">
                                    {issue.latitude && issue.longitude ? (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {Number(issue.latitude).toFixed(4)}, {Number(issue.longitude).toFixed(4)}
                                        </span>
                                    ) : <span />}
                                    <span>{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Expanded: status controls */}
                            {expandedId === issue.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border/50">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {allStatuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(issue.id, s)}
                                                disabled={issue.status === s}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${statusColors[s]}`}
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
