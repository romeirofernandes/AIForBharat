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

/* ─── Custom Node Components ───────────────────────────────────── */

function StartNode({ data }) {
    return (
        <div className="relative px-5 py-4 rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/10 min-w-[200px] max-w-[260px]">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Start</span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-emerald-950" />
        </div>
    );
}

function ActionNode({ data }) {
    return (
        <div className="relative px-5 py-4 rounded-lg border border-border bg-card shadow-md hover:shadow-lg transition-shadow min-w-[200px] max-w-[260px]">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-white dark:!border-card" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-sm bg-primary shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Action</span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-white dark:!border-card" />
        </div>
    );
}

function DecisionNode({ data }) {
    return (
        <div className="relative px-5 py-4 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-lg shadow-amber-500/10 min-w-[200px] max-w-[260px]">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-amber-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">◆ Decision</span>
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
        <div className="relative px-5 py-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 shadow-md min-w-[200px] max-w-[260px]">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-blue-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Review</span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{data.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-blue-950" />
        </div>
    );
}

function EndNode({ data }) {
    return (
        <div className="relative px-5 py-4 rounded-lg border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 shadow-lg shadow-red-500/10 min-w-[200px] max-w-[260px]">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-red-950" />
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">End</span>
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

function buildNodesAndEdges(steps) {
    if (!steps || steps.length === 0) return { nodes: [], edges: [] };

    const X_CENTER = 300;
    const Y_GAP = 140;
    const X_BRANCH_OFFSET = 320;

    // Build a map for quick lookup
    const stepMap = {};
    steps.forEach((s) => (stepMap[s.id] = s));

    // BFS to assign positions
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
            // Yes goes left, No goes right
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

    // Also handle any orphan steps that weren't visited
    let orphanY = Object.keys(positions).length * Y_GAP + 60;
    steps.forEach((s) => {
        if (!positions[s.id]) {
            positions[s.id] = { x: X_CENTER, y: orphanY };
            orphanY += Y_GAP;
        }
    });

    const nodes = steps.map((step) => ({
        id: step.id,
        type: step.type || 'action',
        position: positions[step.id] || { x: X_CENTER, y: 40 },
        data: { title: step.title, description: step.description },
    }));

    const edges = [];
    steps.forEach((step) => {
        if (!step.nextSteps) return;
        if (step.type === 'decision' && step.nextSteps.length >= 2) {
            edges.push({
                id: `${step.id}-yes-${step.nextSteps[0]}`,
                source: step.id,
                target: step.nextSteps[0],
                sourceHandle: 'yes',
                label: 'Yes',
                type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 },
                labelStyle: { fill: '#22c55e', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' },
                labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.9 },
            });
            edges.push({
                id: `${step.id}-no-${step.nextSteps[1]}`,
                source: step.id,
                target: step.nextSteps[1],
                sourceHandle: 'no',
                label: 'No',
                type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 },
                labelStyle: { fill: '#ef4444', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' },
                labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.9 },
            });
        } else {
            step.nextSteps.forEach((nextId) => {
                edges.push({
                    id: `${step.id}-${nextId}`,
                    source: step.id,
                    target: nextId,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: 'var(--primary)', strokeWidth: 2 },
                });
            });
        }
    });

    return { nodes, edges };
}

/* ─── Main Component ──────────────────────────────────────────── */

export default function ResolutionFlow({ steps, loading }) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(
        () => buildNodesAndEdges(steps),
        [steps]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync when steps prop changes
    React.useEffect(() => {
        const { nodes: n, edges: e } = buildNodesAndEdges(steps);
        setNodes(n);
        setEdges(e);
    }, [steps]);

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
        <div className="h-[550px] w-full rounded-lg border border-border bg-card overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
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
