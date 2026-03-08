import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyIssues } from '../../api/issues';
import { RichButton } from '../../components/ui/rich-button';
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

const filters = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];
const filterLabels = { all: 'All', pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected' };

export default function MyComplaints() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        getMyIssues()
            .then((data) => setIssues(data.issues))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = activeFilter === 'all' ? issues : issues.filter(i => i.status === activeFilter);

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">My Complaints</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Track the status of your reported grievances</p>
                </div>
                <RichButton color="default" size="sm" onClick={() => navigate('/user/report')}>
                    Report New Issue
                </RichButton>
            </motion.div>

            {/* Filter Tabs */}
            {issues.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap
                                ${activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                        >
                            {filterLabels[f]}
                            {f !== 'all' && <span className="ml-1.5 opacity-60">({issues.filter(i => f === 'all' || i.status === f).length})</span>}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : issues.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="border border-border rounded-lg p-16 bg-card text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">No complaints filed yet.</p>
                    <RichButton color="default" size="sm" onClick={() => navigate('/user/report')}>
                        Report your first issue
                    </RichButton>
                </motion.div>
            ) : filtered.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="border border-border rounded-lg p-12 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">No complaints with status "{filterLabels[activeFilter]}".</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ delay: i * 0.04 }}
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
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-bold text-foreground leading-snug flex-1">{issue.title}</h3>
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
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
