import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowRight01Icon as ArrowRight,
    Add01Icon as AddIcon,
    SecurityCheckIcon as BadgeIcon,
    Calendar03Icon as CalendarIcon,
    Location04Icon as LocationIcon,
    MoneyReceiveSquareIcon as MoneyIcon,
    InformationCircleIcon as InfoIcon,
    Image01Icon as ImageIcon,
    Video01Icon as VideoIcon,
    Alert02Icon as AlertIcon,
} from 'hugeicons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';
import { getMyComplaints } from '../../api/bribery';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusConfig = {
    submitted: { label: 'Submitted', class: 'bg-blue-100 text-blue-700 border-blue-200', step: 1 },
    under_review: { label: 'Under Review', class: 'bg-amber-100 text-amber-700 border-amber-200', step: 2 },
    action_taken: { label: 'Action Taken', class: 'bg-purple-100 text-purple-700 border-purple-200', step: 3 },
    resolved: { label: 'Resolved', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', step: 4 },
    dismissed: { label: 'Dismissed', class: 'bg-red-100 text-red-700 border-red-200', step: -1 },
};

const statusSteps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'action_taken', label: 'Action Taken' },
    { key: 'resolved', label: 'Resolved' },
];

const allFilters = ['', 'submitted', 'under_review', 'action_taken', 'resolved', 'dismissed'];
const filterLabels = { '': 'All', submitted: 'Submitted', under_review: 'Under Review', action_taken: 'Action Taken', resolved: 'Resolved', dismissed: 'Dismissed' };

function StatusTimeline({ status }) {
    const isDismissed = status === 'dismissed';
    const currentStep = statusConfig[status]?.step || 1;

    return (
        <div className="flex items-center gap-1 w-full mt-4">
            {statusSteps.map((step, i) => {
                const isActive = !isDismissed && currentStep >= step.key === status ? true : statusConfig[step.key]?.step <= currentStep;
                const stepNum = i + 1;
                const filled = !isDismissed && currentStep >= stepNum;

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${filled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {stepNum}
                            </div>
                            <span className={`text-xs font-medium text-center ${filled ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                {step.label}
                            </span>
                        </div>
                        {i < statusSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 mt-[-12px] ${filled && currentStep > stepNum ? 'bg-primary' : 'bg-muted'}`} />
                        )}
                    </React.Fragment>
                );
            })}
            {isDismissed && (
                <div className="flex flex-col items-center gap-1 ml-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white text-[9px] font-bold">✕</div>
                    <span className="text-xs font-medium text-red-600">Dismissed</span>
                </div>
            )}
        </div>
    );
}

export default function MyBriberyReports() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const fetchComplaints = () => {
        setLoading(true);
        getMyComplaints(filter || undefined)
            .then((data) => {
                setComplaints(data.complaints || []);
                setSummary(data.summary || {});
            })
            .catch(() => toast.error('Failed to load complaints'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchComplaints(); }, [filter]);

    return (
        <div className="w-full space-y-6">

            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">My Reports</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Track your misconduct / bribery complaints</p>
                </div>
                <Button onClick={() => navigate('/user/traffic/report-bribery')} className="gap-2 cursor-pointer font-bold uppercase tracking-wider text-xs">
                    <AddIcon size={14} /> File New Report
                </Button>
            </motion.div>

            {/* Summary Stats */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }}>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: summary.total || 0, color: 'text-foreground' },
                        { label: 'Submitted', value: summary.submitted || 0, color: 'text-blue-600' },
                        { label: 'Reviewing', value: summary.under_review || 0, color: 'text-amber-600' },
                        { label: 'Action', value: summary.action_taken || 0, color: 'text-purple-600' },
                        { label: 'Resolved', value: summary.resolved || 0, color: 'text-emerald-600' },
                        { label: 'Dismissed', value: summary.dismissed || 0, color: 'text-red-600' },
                    ].map((s) => (
                        <Card key={s.label} className="border-border">
                            <CardContent className="p-3 text-center">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
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
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${filter === f
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
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertIcon size={32} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">
                            {filter ? 'No complaints with this status.' : 'You haven\'t filed any complaints yet.'}
                        </p>
                        <Button onClick={() => navigate('/user/traffic/report-bribery')} className="mt-4 cursor-pointer gap-2 text-xs font-bold uppercase tracking-wider" size="sm">
                            <AddIcon size={14} /> File Your First Report
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {complaints.map((c, i) => {
                        const sc = statusConfig[c.status] || statusConfig.submitted;
                        const isExpanded = expandedId === c.id;

                        return (
                            <motion.div
                                key={c.id}
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                transition={{ delay: 0.1 + i * 0.03 }}
                                className="border border-border rounded-lg bg-card hover:border-primary/20 transition-all overflow-hidden"
                            >
                                {/* Card Header */}
                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold font-mono tracking-wider text-foreground">#{c.id}</span>
                                            <Badge className={`text-[9px] font-bold uppercase tracking-wider ${sc.class}`}>{sc.label}</Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground/60">
                                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">{c.complaintType === 'Other' ? c.otherComplaintType || 'Other' : c.complaintType}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60">
                                        <span className="flex items-center gap-1"><BadgeIcon size={11} /> {c.badgeNumber}</span>
                                        {c.location && <span className="flex items-center gap-1"><LocationIcon size={11} /> {c.location}</span>}
                                        {c.amountDemanded && <span className="flex items-center gap-1"><MoneyIcon size={11} /> ₹{c.amountDemanded.toLocaleString('en-IN')}</span>}
                                    </div>
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
                                                {/* Description */}
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                                                    <p className="text-xs text-foreground font-medium leading-relaxed">{c.description}</p>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Incident</p>
                                                        <p className="text-xs font-medium text-foreground">
                                                            {new Date(c.incidentAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {c.challanNumber && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Challan #</p>
                                                            <p className="text-xs font-mono font-medium text-foreground">{c.challanNumber}</p>
                                                        </div>
                                                    )}
                                                    {c.amountDemanded && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Amount Demanded</p>
                                                            <p className="text-xs font-bold text-red-600">₹{c.amountDemanded.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Media */}
                                                {c.mediaUrls && c.mediaUrls.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">Proof / Evidence</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {c.mediaUrls.map((url, j) => {
                                                                const isVideo = url.match(/\.(mp4|webm|mov|avi)/i);
                                                                return (
                                                                    <a
                                                                        key={j}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md bg-muted/30 hover:bg-muted/60 transition-colors text-xs font-medium text-primary"
                                                                    >
                                                                        {isVideo ? <VideoIcon size={12} /> : <ImageIcon size={12} />}
                                                                        {isVideo ? 'Video' : 'Photo'} {j + 1}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Timeline */}
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Status Progress</p>
                                                    <StatusTimeline status={c.status} />
                                                </div>

                                                {/* Admin Note */}
                                                {c.adminNote && (
                                                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                                                        <p className="text-xs font-medium text-amber-700 mb-1">Admin Note</p>
                                                        <p className="text-xs text-amber-800 font-medium">{c.adminNote}</p>
                                                    </div>
                                                )}
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
