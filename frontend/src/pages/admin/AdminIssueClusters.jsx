import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAggregatedIssues, getResolutionFlow } from '../../api/issues';
import ResolutionFlow from '../../components/ResolutionFlow';
import { toast } from 'sonner';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
};

function StatusBar({ statuses, total }) {
    if (total === 0) return null;
    const segments = [
        { key: 'pending', color: 'bg-amber-500', count: statuses.pending || 0 },
        { key: 'in_progress', color: 'bg-blue-500', count: statuses.in_progress || 0 },
        { key: 'resolved', color: 'bg-emerald-500', count: statuses.resolved || 0 },
        { key: 'rejected', color: 'bg-red-500', count: statuses.rejected || 0 },
    ];

    return (
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted gap-[1px]">
            {segments.map((seg) =>
                seg.count > 0 ? (
                    <motion.div
                        key={seg.key}
                        className={`h-full ${seg.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(seg.count / total) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        title={`${statusLabels[seg.key]}: ${seg.count}`}
                    />
                ) : null
            )}
        </div>
    );
}

export default function AdminIssueClusters() {
    const [clusters, setClusters] = useState([]);
    const [totalIssues, setTotalIssues] = useState(0);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Resolution flow state
    const [flowSteps, setFlowSteps] = useState(null);
    const [flowLoading, setFlowLoading] = useState(false);
    const [activeFlowCluster, setActiveFlowCluster] = useState(null);

    useEffect(() => {
        fetchClusters();
    }, []);

    const fetchClusters = async () => {
        setLoading(true);
        try {
            const data = await getAggregatedIssues();
            setClusters(data.clusters);
            setTotalIssues(data.totalIssues);
        } catch (err) {
            toast.error('Failed to load issue clusters');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlow = async (cluster, index) => {
        setFlowLoading(true);
        setFlowSteps(null);
        setActiveFlowCluster(index);

        try {
            const data = await getResolutionFlow({
                incidentType: cluster.incidentType,
                department: cluster.department,
                count: cluster.count,
                sampleDescriptions: cluster.issues.slice(0, 5).map((i) => i.description),
            });
            setFlowSteps(data.flow?.steps || []);
        } catch (err) {
            toast.error('Failed to generate resolution flow');
            setFlowSteps(null);
        } finally {
            setFlowLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">
                    Issue Clusters
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                    Similar issues aggregated by type & location for faster resolution
                </p>
            </motion.div>

            {/* Summary cards */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-5 bg-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Issues</p>
                    <p className="text-3xl font-bold text-foreground">{totalIssues}</p>
                </div>
                <div className="border border-border rounded-lg p-5 bg-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Clusters Found</p>
                    <p className="text-3xl font-bold text-foreground">{clusters.length}</p>
                </div>
                <div className="border border-border rounded-lg p-5 bg-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Hotspot</p>
                    <p className="text-lg font-bold text-foreground truncate">
                        {clusters.length > 0 ? `${clusters[0].incidentType} (${clusters[0].count})` : '—'}
                    </p>
                </div>
            </motion.div>

            {/* Cluster List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : clusters.length === 0 ? (
                <div className="border border-border rounded-lg p-12 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">No issues found to cluster</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {clusters.map((cluster, i) => (
                        <motion.div
                            key={`${cluster.incidentType}-${cluster.latitude}-${cluster.longitude}-${i}`}
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ delay: i * 0.04 }}
                            className="border border-border rounded-lg bg-card hover:border-primary/20 transition-all overflow-hidden"
                        >
                            {/* Cluster Header */}
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                                {cluster.incidentType}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                {cluster.count} {cluster.count === 1 ? 'report' : 'reports'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
                                            {cluster.department}{' '}
                                            {cluster.latitude != null && cluster.longitude != null && (
                                                <span>• {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Status badges */}
                                    <div className="flex gap-1.5 flex-wrap shrink-0">
                                        {Object.entries(cluster.statuses).map(([status, count]) =>
                                            count > 0 ? (
                                                <span
                                                    key={status}
                                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${statusColors[status]}`}
                                                >
                                                    {count} {statusLabels[status]}
                                                </span>
                                            ) : null
                                        )}
                                    </div>
                                </div>

                                {/* Status bar */}
                                <div className="mt-3">
                                    <StatusBar statuses={cluster.statuses} total={cluster.count} />
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            <AnimatePresence>
                                {expandedIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-2 border-t border-border/50 space-y-4">
                                            {/* Individual issues */}
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                                    Individual Reports ({cluster.issues.length})
                                                </p>
                                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                                    {cluster.issues.map((issue) => (
                                                        <div
                                                            key={issue.id}
                                                            className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border/50"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded ${statusColors[issue.status]}`}>
                                                                        {statusLabels[issue.status]}
                                                                    </span>
                                                                    <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                                                                        #{issue.id}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-foreground line-clamp-2">{issue.description}</p>
                                                                <p className="text-[9px] text-muted-foreground/50 mt-1">
                                                                    {issue.user?.email} • {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                                                                </p>
                                                            </div>
                                                            {issue.imageUrl && (
                                                                <a
                                                                    href={issue.imageUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="shrink-0 w-14 h-14 rounded-md overflow-hidden border border-border bg-muted"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <img
                                                                        src={issue.imageUrl}
                                                                        alt="Issue"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Generate Resolution Flow Button */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGenerateFlow(cluster, i);
                                                    }}
                                                    disabled={flowLoading && activeFlowCluster === i}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {flowLoading && activeFlowCluster === i ? (
                                                        <>
                                                            <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                            Generating…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">account_tree</span>
                                                            Generate Resolution Flow
                                                        </>
                                                    )}
                                                </button>
                                                {activeFlowCluster === i && flowSteps && (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                                        ✓ Flow generated
                                                    </span>
                                                )}
                                            </div>

                                            {/* Resolution Flow */}
                                            {activeFlowCluster === i && (flowLoading || flowSteps) && (
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                                        AI Resolution Workflow
                                                    </p>
                                                    <ResolutionFlow steps={flowSteps} loading={flowLoading} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
