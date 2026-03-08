import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAggregatedIssues, getResolutionFlow } from '../../api/issues';
import { getClusterWorkflows } from '../../api/workflows';
import ResolutionFlow from '../../components/ResolutionFlow';
import WorkflowStepPanel from '../../components/WorkflowStepPanel';
import { RichButton } from '../../components/ui/rich-button';
import { toast } from 'sonner';
import {
    Tick01Icon,
    RefreshIcon,
    Route01Icon,
    ThumbsUpIcon,
    FlashIcon,
    Grid01Icon,
    Alert01Icon,
    Location01Icon,
    UserIcon,
    Folder01Icon
} from 'hugeicons-react';

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
    pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected',
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
                    <motion.div key={seg.key} className={`h-full ${seg.color} rounded-full`}
                        initial={{ width: 0 }} animate={{ width: `${(seg.count / total) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }} title={`${statusLabels[seg.key]}: ${seg.count}`}
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

    const [clusterFlows, setClusterFlows] = useState({});
    const [clusterFlowLoading, setClusterFlowLoading] = useState({});
    const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(null);

    useEffect(() => { fetchClusters(); }, []);

    const fetchClusters = async () => {
        setLoading(true);
        try {
            const data = await getAggregatedIssues();
            setClusters(data.clusters);
            setTotalIssues(data.totalIssues);
        } catch {
            toast.error('Failed to load issue clusters');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlow = async (cluster, index) => {
        setClusterFlowLoading((prev) => ({ ...prev, [index]: true }));
        setClusterFlows((prev) => ({ ...prev, [index]: null }));

        try {
            const data = await getResolutionFlow({
                incidentType: cluster.incidentType,
                department: cluster.department,
                count: cluster.count,
                sampleDescriptions: cluster.issues.slice(0, 5).map((i) => i.description),
                clusterKey: cluster.clusterKey,
                issueIds: cluster.issues.map((i) => i.id),
            });

            setClusterFlows((prev) => ({
                ...prev,
                [index]: { steps: data.flow?.steps || [], workflow: data.workflow },
            }));
            setActiveWorkflowIndex(index);
            toast.success('Resolution workflow generated & saved!');
        } catch {
            toast.error('Failed to generate resolution flow');
        } finally {
            setClusterFlowLoading((prev) => ({ ...prev, [index]: false }));
        }
    };

    const loadExistingWorkflow = async (cluster, index) => {
        if (!cluster.clusterKey || clusterFlows[index]) return;
        try {
            const data = await getClusterWorkflows(cluster.clusterKey);
            if (data.workflows && data.workflows.length > 0) {
                const w = data.workflows[0];
                setClusterFlows((prev) => ({
                    ...prev,
                    [index]: { steps: w.flowJson?.steps || [], workflow: w },
                }));
                setActiveWorkflowIndex(index);
            }
        } catch {
        }
    };

    const handleWorkflowUpdate = useCallback((index, updatedWorkflow) => {
        setClusterFlows((prev) => ({
            ...prev,
            [index]: { ...prev[index], workflow: updatedWorkflow },
        }));
    }, []);

    const handleNodeClick = useCallback((index, node) => {
        setActiveWorkflowIndex(index);
    }, []);

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                    <Grid01Icon size={28} className="text-primary" />
                    Issue Clusters
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                    <Alert01Icon size={12} /> Similar reports aggregated by location
                </p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border/60 rounded-xl p-5 bg-card">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium mb-1">Total Issues</p>
                    <p className="text-3xl font-black text-foreground">{totalIssues}</p>
                </div>
                <div className="border border-border/60 rounded-xl p-5 bg-card">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium mb-1">Clusters Found</p>
                    <p className="text-3xl font-black text-foreground">{clusters.length}</p>
                </div>
                <div className="border border-border/60 rounded-xl p-5 bg-card">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium mb-1">Hotspot Type</p>
                    <p className="text-lg font-black text-primary truncate">
                        {clusters.length > 0 ? clusters[0].incidentType : '—'}
                    </p>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : clusters.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-32 bg-card text-center">
                    <p className="text-sm text-muted-foreground font-medium">Queue clear — no clusters found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {clusters.map((cluster, i) => {
                        const flow = clusterFlows[i];
                        const isFlowLoading = !!clusterFlowLoading[i];
                        const isWorkflowActive = activeWorkflowIndex === i && flow;

                        return (
                            <motion.div
                                key={`${cluster.incidentType}-${cluster.latitude}-${cluster.longitude}-${i}`}
                                initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: i * 0.04 }}
                                className={`border border-border/80 rounded-xl bg-card hover:border-primary/30 hover:shadow-xl transition-all overflow-hidden ${expandedIndex === i ? 'ring-2 ring-primary/10' : ''}`}
                            >
                                <div className="p-6 cursor-pointer" onClick={() => {
                                    const next = expandedIndex === i ? null : i;
                                    setExpandedIndex(next);
                                    if (next !== null) loadExistingWorkflow(cluster, i);
                                }}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{cluster.incidentType}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                                    <Folder01Icon size={12} variant="solid" /> {cluster.count} {cluster.count === 1 ? 'report' : 'reports'}
                                                </span>
                                                {cluster.totalVotes > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground font-medium">
                                                        <ThumbsUpIcon size={12} variant="solid" className="text-primary" /> {cluster.totalVotes}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                                                    {cluster.department}
                                                </p>
                                                {cluster.latitude != null && (
                                                    <p className="text-xs text-muted-foreground/40 flex items-center gap-1.5">
                                                        <Location01Icon size={10} /> {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap shrink-0">
                                            {Object.entries(cluster.statuses).map(([status, count]) =>
                                                count > 0 ? (
                                                    <span key={status} className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border border-current/10 ${statusColors[status]}`}>
                                                        {count} {statusLabels[status]}
                                                    </span>
                                                ) : null
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <StatusBar statuses={cluster.statuses} total={cluster.count} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-8 pt-2 border-t border-border/50 space-y-6 bg-muted/5">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium mb-4 px-1 flex items-center gap-2">
                                                        <Folder01Icon size={12} /> Individual Reports
                                                    </p>
                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {cluster.issues.map((issue) => (
                                                            <div key={issue.id} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border group/item hover:border-primary/20 transition-all">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border border-current/10 ${statusColors[issue.status]}`}>
                                                                            {statusLabels[issue.status]}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground/50 font-medium">#{issue.id}</span>
                                                                        {issue.priorityScore > 0 && (
                                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                                                                <FlashIcon size={10} variant="solid" /> {Math.round(issue.priorityScore)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">{issue.description}</p>
                                                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/50">
                                                                        <span className="flex items-center gap-1"><UserIcon size={10} /> {issue.user?.email}</span>
                                                                        <span>• {new Date(issue.createdAt).toLocaleDateString('en-IN')}</span>
                                                                    </div>
                                                                </div>
                                                                {issue.imageUrl && (
                                                                    <a href={issue.imageUrl} target="_blank" rel="noopener noreferrer"
                                                                        className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted shadow-sm hover:scale-105 transition-transform"
                                                                        onClick={(e) => e.stopPropagation()}>
                                                                        <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pt-2">
                                                    <RichButton
                                                        color="primary"
                                                        onClick={(e) => { e.stopPropagation(); handleGenerateFlow(cluster, i); }}
                                                        disabled={isFlowLoading}
                                                        className="text-[10px] font-black uppercase tracking-[0.2em]"
                                                    >
                                                        {isFlowLoading ? (
                                                            <><span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Generating…</>
                                                        ) : (
                                                            <>{flow ? <RefreshIcon size={14} /> : <Route01Icon size={14} />} {flow ? 'Regenerate' : 'Generate'} Resolution Flow</>
                                                        )}
                                                    </RichButton>
                                                    {flow && !isFlowLoading && (
                                                        <span className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                                                            <Tick01Icon size={14} variant="solid" /> Workflow Active
                                                        </span>
                                                    )}
                                                </div>

                                                {(isFlowLoading || flow) && (
                                                    <div className="space-y-8 mt-4">
                                                        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
                                                            <div className="px-6 py-4 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                                                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                                    <Route01Icon size={14} variant="solid" className="text-primary" /> Visual Logic
                                                                </p>
                                                            </div>
                                                            <ResolutionFlow
                                                                steps={flow?.steps}
                                                                loading={isFlowLoading}
                                                                workflowSteps={flow?.workflow?.steps}
                                                                onNodeClick={(node) => handleNodeClick(i, node)}
                                                            />
                                                        </div>

                                                        {isWorkflowActive && flow?.workflow && (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                                <p className="text-sm font-medium text-primary mb-4 px-1 flex items-center gap-2">
                                                                    <Tick01Icon size={14} variant="solid" /> Execution Engine
                                                                </p>
                                                                <WorkflowStepPanel
                                                                    workflow={flow.workflow}
                                                                    onWorkflowUpdate={(updated) => handleWorkflowUpdate(i, updated)}
                                                                />
                                                            </motion.div>
                                                        )}
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
