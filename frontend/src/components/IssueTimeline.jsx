import React from 'react';
import { motion } from 'framer-motion';
import {
    Flag01Icon,
    Tick01Icon,
    Comment01Icon,
    Agreement01Icon,
    RefreshIcon,
    Route01Icon,
    UserIcon,
    BubbleChatIcon,
    WasteIcon
} from 'hugeicons-react';

const ACTION_CONFIG = {
    issue_created: { icon: Flag01Icon, label: 'Issue Reported', color: 'border-emerald-400 dark:border-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    vote_added: { icon: Agreement01Icon, label: 'Vote Added', color: 'border-blue-400 dark:border-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    vote_removed: { icon: WasteIcon, label: 'Vote Removed', color: 'border-slate-300 dark:border-slate-600', dot: 'bg-slate-400', bg: 'bg-muted/60' },
    comment_added: { icon: Comment01Icon, label: 'Comment Added', color: 'border-violet-400 dark:border-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    status_updated: { icon: RefreshIcon, label: 'Status Updated', color: 'border-amber-400 dark:border-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    workflow_created: { icon: Route01Icon, label: 'Workflow Generated', color: 'border-primary/60', dot: 'bg-primary', bg: 'bg-primary/5' },
    workflow_step_completed: { icon: Tick01Icon, label: 'Workflow Step Completed', color: 'border-emerald-400 dark:border-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
};

function getLabel(action, metadata) {
    const cfg = ACTION_CONFIG[action];
    if (!cfg) return action.replace(/_/g, ' ');

    if (action === 'status_updated' && metadata?.newStatus) {
        return `Status Update: ${metadata.newStatus.replace(/_/g, ' ')}`;
    }
    if (action === 'workflow_step_completed' && metadata?.stepTitle) {
        return `Step Complete: ${metadata.stepTitle}`;
    }
    return cfg.label;
}

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function TimelineEntry({ entry, index, isLast }) {
    const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.issue_created;
    const label = getLabel(entry.action, entry.metadata);
    const Icon = cfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="relative flex gap-4"
        >
            {/* Vertical line */}
            {!isLast && (
                 <div className="absolute left-3.75 top-8 bottom-0 w-0.5 bg-border" />
            )}

            {/* Dot/Icon Container */}
            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${cfg.dot} flex items-center justify-center shadow-lg border-2 border-background mt-0.5`}>
                 <Icon size={14} className="text-white" variant="solid" />
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 border ${cfg.color} rounded-lg p-4 ${cfg.bg} mb-4 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                            {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="flex items-center gap-1">
                                <UserIcon size={10} /> {entry.actor?.name || entry.actor?.email || 'System'}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/30">
                                {entry.actorRole}
                            </span>
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground/40 whitespace-nowrap shrink-0 mt-0.5">
                        {formatTime(entry.createdAt)}
                    </span>
                </div>

                {/* Extra metadata */}
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                        {entry.action === 'status_updated' && (
                            <div className="flex items-center gap-2">
                                <RefreshIcon size={10} />
                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300/30`}>
                                    {entry.metadata.newStatus?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        )}
                        {entry.action === 'vote_added' && (
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${entry.metadata.value === 1 ? 'text-emerald-600' : 'text-red-500'}`}>
                                <Agreement01Icon size={12} />
                                {entry.metadata.value === 1 ? '+1 Upvote' : '-1 Downvote'}
                            </div>
                        )}
                        {entry.action === 'comment_added' && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                                <Comment01Icon size={12} /> New Comment Added
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function IssueTimeline({ timeline, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                        <div className="flex-1 h-20 rounded-lg bg-muted" />
                    </div>
                ))}
            </div>
        );
    }

    if (!timeline || timeline.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                <BubbleChatIcon size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em]">No history records</p>
            </div>
        );
    }

    return (
        <div className="relative pl-2">
            {timeline.map((entry, i) => (
                <TimelineEntry
                    key={entry.id}
                    entry={entry}
                    index={i}
                    isLast={i === timeline.length - 1}
                />
            ))}
        </div>
    );
}
