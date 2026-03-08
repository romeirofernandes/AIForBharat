import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    PlayIcon,
    FlashIcon,
    HelpCircleIcon,
    SearchIcon,
    Tick01Icon,
    StopIcon,
    UserIcon
} from 'hugeicons-react';

/* ─── Custom Node Components ───────────────────────────────────── */

function NodeShell({ color, borderClass, bgClass, shadowClass, badgeClass, badgeLabel, icon: Icon, children, isActive, isCompleted }) {
    return (
        <div className={`relative px-5 py-4 rounded-xl border-2 ${borderClass} ${bgClass} ${shadowClass} min-w-[200px] max-w-[270px] transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''} ${isCompleted ? 'opacity-80' : ''}`}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`w-2 h-2 rounded-full ${color} ${isActive ? 'animate-pulse' : ''} shrink-0`} />
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 ${badgeClass}`}>
                    <Icon size={10} variant="solid" /> {badgeLabel}
                </span>
                {isCompleted && (
                    <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Tick01Icon size={10} /> Done
                    </span>
                )}
                {isActive && !isCompleted && (
                    <span className="ml-auto text-[9px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">● Active</span>
                )}
            </div>
            {children}
        </div>
    );
}

function StartNode({ data }) {
    return (
        <NodeShell
            color="bg-emerald-500" borderClass="border-emerald-500" bgClass="bg-emerald-50 dark:bg-emerald-950/40"
            shadowClass="shadow-lg shadow-emerald-500/10" badgeClass="text-emerald-600 dark:text-emerald-400"
            badgeLabel="Start" icon={PlayIcon} isActive={data.isActive} isCompleted={data.isCompleted}
        >
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-emerald-950" />
        </NodeShell>
    );
}

function ActionNode({ data }) {
    return (
        <div
            className={`relative px-5 py-4 rounded-xl border ${data.isCompleted ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-card'} shadow-md hover:shadow-lg transition-all min-w-[200px] max-w-[270px] ${data.isActive ? 'ring-2 ring-primary' : ''}`}
        >
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-white dark:!border-card" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-sm ${data.isCompleted ? 'bg-emerald-500' : 'bg-primary'} shrink-0`} />
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 ${data.isCompleted ? 'text-emerald-600' : 'text-primary'}`}>
                    <FlashIcon size={10} variant="solid" /> Action
                </span>
                {data.isCompleted && (
                    <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Tick01Icon size={10} /> Done
                    </span>
                )}
                {data.isActive && !data.isCompleted && <span className="ml-auto text-[9px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">● Active</span>}
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            {data.assignedTo && (
                <p className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <UserIcon size={10} /> {data.assignedTo}
                </p>
            )}
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-white dark:!border-card" />
        </div>
    );
}

function DecisionNode({ data }) {
    return (
        <div className={`relative px-5 py-4 rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-lg shadow-amber-500/10 min-w-[200px] max-w-[270px] ${data.isActive ? 'ring-2 ring-primary' : ''} ${data.isCompleted ? 'opacity-80' : ''}`}>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-amber-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <HelpCircleIcon size={10} variant="solid" /> Decision
                </span>
                {data.isCompleted && (
                    <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                        <Tick01Icon size={10} /> Done
                    </span>
                )}
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} id="yes" className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-amber-950 !left-[30%]" />
            <Handle type="source" position={Position.Bottom} id="no" className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-amber-950 !left-[70%]" />
        </div>
    );
}

function ReviewNode({ data }) {
    return (
        <div className={`relative px-5 py-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 shadow-md min-w-[200px] max-w-[270px] ${data.isActive ? 'ring-2 ring-primary' : ''} ${data.isCompleted ? 'opacity-80' : ''}`}>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-blue-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <SearchIcon size={10} variant="solid" /> Review
                </span>
                {data.isCompleted && (
                    <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                        <Tick01Icon size={10} /> Done
                    </span>
                )}
                {data.isActive && !data.isCompleted && <span className="ml-auto text-[9px] font-bold text-blue-600 animate-pulse">● Active</span>}
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-blue-950" />
        </div>
    );
}

function EndNode({ data }) {
    return (
        <div className={`relative px-5 py-4 rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 shadow-lg shadow-red-500/10 min-w-[200px] max-w-[270px] ${data.isCompleted ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : ''}`}>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-red-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1 text-red-600 dark:text-red-400">
                    <StopIcon size={10} variant="solid" /> End
                </span>
                {data.isCompleted && (
                    <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                        <Tick01Icon size={10} /> Resolved
                    </span>
                )}
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
        </div>
    );
}

const nodeTypes = {
    start: StartNode,
    action: ActionNode,
    decision: DecisionNode,
    review: ReviewNode,
    end: EndNode,
};

/* ─── Layout helper: auto-position nodes ──────────────────────── */

function buildNodesAndEdges(steps, workflowSteps) {
    if (!steps || steps.length === 0) return { nodes: [], edges: [] };

    const X_CENTER = 300;
    const Y_GAP = 160;
    const X_BRANCH_OFFSET = 340;

    // Build status lookup from workflowSteps
    const stepStatusMap = {};
    if (workflowSteps) {
        workflowSteps.forEach((ws) => {
            stepStatusMap[ws.stepId] = ws;
        });
    }

    const stepMap = {};
    steps.forEach((s) => (stepMap[s.id] = s));

    const visited = new Set();
    const positions = {};
    const queue = [{ id: steps[0].id, x: X_CENTER, y: 40 }];
    visited.add(steps[0].id);

    while (queue.length > 0) {
        const { id, x, y } = queue.shift();
        positions[id] = { x, y };

        const step = stepMap[id];
        if (!step || !step.nextSteps) continue;

        if (step.type === 'decision' && step.nextSteps.length >= 2) {
            const [yesId, noId] = step.nextSteps;
            if (yesId && !visited.has(yesId)) {
                visited.add(yesId);
                queue.push({ id: yesId, x: x - X_BRANCH_OFFSET / 2, y: y + Y_GAP });
            }
            if (noId && !visited.has(noId)) {
                visited.add(noId);
                queue.push({ id: noId, x: x + X_BRANCH_OFFSET / 2, y: y + Y_GAP });
            }
        } else {
            step.nextSteps.forEach((nextId) => {
                if (!visited.has(nextId)) {
                    visited.add(nextId);
                    queue.push({ id: nextId, x, y: y + Y_GAP });
                }
            });
        }
    }

    let orphanY = Object.keys(positions).length * Y_GAP + 60;
    steps.forEach((s) => {
        if (!positions[s.id]) {
            positions[s.id] = { x: X_CENTER, y: orphanY };
            orphanY += Y_GAP;
        }
    });

    const nodes = steps.map((step) => {
        const ws = stepStatusMap[step.id];
        return {
            id: step.id,
            type: step.type || 'action',
            position: positions[step.id] || { x: X_CENTER, y: 40 },
            data: {
                title: step.title,
                description: step.description,
                isActive: ws?.status === 'active',
                isCompleted: ws?.status === 'completed',
                assignedTo: ws?.assignedTo || null,
                workflowStepId: ws?.id || null,
            },
        };
    });

    const edges = [];
    steps.forEach((step) => {
        if (!step.nextSteps) return;
        if (step.type === 'decision' && step.nextSteps.length >= 2) {
            edges.push({
                id: `${step.id}-yes-${step.nextSteps[0]}`,
                source: step.id, target: step.nextSteps[0],
                sourceHandle: 'yes', label: 'Yes', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 },
                labelStyle: { fill: '#22c55e', fontWeight: 700, fontSize: 10 },
                labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.9 },
            });
            edges.push({
                id: `${step.id}-no-${step.nextSteps[1]}`,
                source: step.id, target: step.nextSteps[1],
                sourceHandle: 'no', label: 'No', type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 },
                labelStyle: { fill: '#ef4444', fontWeight: 700, fontSize: 10 },
                labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.9 },
            });
        } else {
            step.nextSteps.forEach((nextId) => {
                edges.push({
                    id: `${step.id}-${nextId}`, source: step.id, target: nextId,
                    type: 'smoothstep', animated: true,
                    style: { stroke: 'var(--primary)', strokeWidth: 2 },
                });
            });
        }
    });

    return { nodes, edges };
}

/* ─── Main Component ──────────────────────────────────────────── */

export default function ResolutionFlow({ steps, loading, workflowSteps, onNodeClick }) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(
        () => buildNodesAndEdges(steps, workflowSteps),
        [steps, workflowSteps]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        const { nodes: n, edges: e } = buildNodesAndEdges(steps, workflowSteps);
        setNodes(n);
        setEdges(e);
    }, [steps, workflowSteps]);

    const handleNodeClick = useCallback((event, node) => {
        onNodeClick?.(node);
    }, [onNodeClick]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Generating Resolution Flow</p>
                    <p className="text-[11px] text-muted-foreground mt-1">AI is analyzing the cluster and building steps…</p>
                </div>
            </div>
        );
    }

    if (!steps || steps.length === 0) {
        return (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground text-sm">
                No resolution flow available. Click "Generate Flow" on a cluster.
            </div>
        );
    }

    return (
        <div className="h-[580px] w-full rounded-xl border border-border bg-card overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.3}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="var(--border)" gap={20} size={1} />
                <Controls
                    showInteractive={false}
                    className="!bg-card !border-border !shadow-lg !rounded-lg"
                />
            </ReactFlow>
        </div>
    );
}
