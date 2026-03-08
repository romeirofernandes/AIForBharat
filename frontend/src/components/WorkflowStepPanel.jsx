import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateWorkflowStep } from '../api/workflows';
import { toast } from 'sonner';
import {
    Tick01Icon,
    PlayIcon,
    LockIcon,
    UserIcon,
    Note01Icon,
    ArrowRight01Icon,
    Settings01Icon,
    Calendar01Icon,
    FlashIcon,
    AlertCircleIcon
} from 'hugeicons-react';

const stepTypeLabels = {
    start: 'Initialize',
    action: 'Action Required',
    decision: 'Decision Point',
    review: 'Quality Review',
    end: 'Resolution',
};

const stepTypeIcons = {
    start: PlayIcon,
    action: FlashIcon,
    decision: AlertCircleIcon,
    review: Settings01Icon,
    end: Tick01Icon,
};

function StatusIndicator({ status }) {
    if (status === 'completed') return <Tick01Icon size={14} className="text-emerald-500" variant="solid" />;
    if (status === 'active') return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />;
    return <LockIcon size={14} className="text-muted-foreground/40" variant="solid" />;
}

export default function WorkflowStepPanel({ workflow, onWorkflowUpdate }) {
    const steps = workflow?.steps || [];
    const totalSteps = steps.length;
    const completedCount = steps.filter(s => s.status === 'completed').length;
    const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    const [selectedStep, setSelectedStep] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const handleStepClick = (step) => {
        if (step.status === 'locked') {
            toast.error('This step is locked. Complete previous steps first.');
            return;
        }
        setSelectedStep(step);
        setNotes(step.notes || '');
        setAssignedTo(step.assignedTo || '');
    };

    const handleComplete = async () => {
        if (!selectedStep) return;
        setIsUpdating(true);
        try {
            const data = await updateWorkflowStep(selectedStep.id, {
                status: 'completed',
                notes,
                assignedTo
            });
            toast.success('Step marked as completed!');
            onWorkflowUpdate(data.workflow);
            setSelectedStep(null);
        } catch (err) {
            toast.error(err.message || 'Failed to update step');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!selectedStep) return;
        setIsUpdating(true);
        try {
            const data = await updateWorkflowStep(selectedStep.id, {
                notes,
                assignedTo
            });
            toast.success('Step details saved');
            onWorkflowUpdate(data.workflow);
        } catch (err) {
            toast.error(err.message || 'Failed to save details');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Progress Header */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Workflow Progress</p>
                        <p className="text-lg font-bold text-foreground flex items-center gap-2">
                            {completedCount} / {totalSteps} <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Steps Completed</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
                        <p className="text-xs font-medium text-muted-foreground">Overall Completion</p>
                    </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden shadow-inner">
                    <motion.div
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Step List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {steps.map((step, idx) => {
                    const StepIcon = stepTypeIcons[step.type] || FlashIcon;
                    return (
                        <motion.button
                            key={step.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStepClick(step)}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all group ${step.status === 'completed'
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                                : step.status === 'active'
                                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                                    : 'bg-card border-border opacity-50 grayscale'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`flex items-center gap-1.5 text-xs font-medium ${step.status === 'completed' ? 'text-emerald-700 dark:text-emerald-400' :
                                    step.status === 'active' ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'
                                    }`}>
                                    <StepIcon size={12} variant="solid" /> {stepTypeLabels[step.type] || step.type}
                                </span>
                                <StatusIndicator status={step.status} />
                            </div>
                            <p className="text-xs font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">{step.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {step.assignedTo && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <UserIcon size={10} /> {step.assignedTo}
                                    </span>
                                )}
                                {step.notes && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <Note01Icon size={10} /> Notes
                                    </span>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Step Detail Drawer/Modal (Inline) */}
            <AnimatePresence>
                {selectedStep && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="border-2 border-primary/30 rounded-2xl bg-card overflow-hidden shadow-2xl shadow-primary/10"
                    >
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                                        <Settings01Icon size={12} variant="solid" /> Step Management
                                    </p>
                                    <h3 className="text-xl font-bold text-foreground leading-tight">{selectedStep.title}</h3>
                                </div>
                                <button onClick={() => setSelectedStep(null)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">✕</button>
                            </div>

                            <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50 italic">
                                "{selectedStep.description}"
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-1">
                                            <UserIcon size={12} /> Assign Officer
                                        </label>
                                        <input
                                            type="text"
                                            value={assignedTo}
                                            onChange={(e) => setAssignedTo(e.target.value)}
                                            placeholder="Enter officer name..."
                                            className="w-full h-11 px-4 rounded-xl bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-1">
                                            <Note01Icon size={12} /> Internal Notes
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            placeholder="Action taken, findings, etc..."
                                            className="w-full p-4 rounded-xl bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end space-y-3">
                                    <button
                                        onClick={handleSaveDetails}
                                        disabled={isUpdating}
                                        className="h-11 inline-flex items-center justify-center gap-2 bg-muted/80 text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-all disabled:opacity-50"
                                    >
                                        <Settings01Icon size={14} /> Save Details
                                    </button>
                                    <button
                                        onClick={handleComplete}
                                        disabled={isUpdating || selectedStep.status === 'completed'}
                                        className={`h-14 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${selectedStep.status === 'completed'
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                            : 'bg-primary text-primary-foreground shadow-primary/20 hover:opacity-95'
                                            }`}
                                    >
                                        <Tick01Icon size={16} variant="solid" />
                                        {selectedStep.status === 'completed' ? 'Step Finished' : 'Mark as Complete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
