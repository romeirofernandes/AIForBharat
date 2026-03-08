import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Home01Icon,
    City01Icon,
    News01Icon,
    CrownIcon,
    Note01Icon,
    Comment01Icon,
    Agreement01Icon,
    StarIcon,
    Sorting01Icon,
    Medal01Icon,
    ChampionIcon,
    Flag01Icon
} from '@hugeicons/core-free-icons';

const TRUST_CONFIG = {
    1: { label: 'Citizen', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/60', border: 'border-slate-300 dark:border-slate-600', icon: City01Icon, ring: 'bg-slate-400' },
    2: { label: 'Active Citizen', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-600', icon: Home01Icon, ring: 'bg-blue-500' },
    3: { label: 'Community Reporter', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-300 dark:border-violet-600', icon: News01Icon, ring: 'bg-violet-500' },
    4: { label: 'Civic Leader', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-600', icon: CrownIcon, ring: 'bg-amber-500' },
};

const ACHIEVEMENT_ICONS = {
    first_report: Note01Icon,
    ten_reports: ChampionIcon,
    fifty_reports: StarIcon,
    commenter: Comment01Icon,
    active_commenter: Comment01Icon,
    active_citizen: Home01Icon,
    community_reporter: News01Icon,
    civic_leader: CrownIcon,
    voter: Agreement01Icon,
};

const NEXT_THRESHOLD = { 1: 50, 2: 150, 3: 500, 4: null };

function TrustLevelBadge({ tier }) {
    const cfg = TRUST_CONFIG[tier] || TRUST_CONFIG[1];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <HugeiconsIcon icon={Icon} size={12} color="currentColor" strokeWidth={1.5} />
            {cfg.label}
        </span>
    );
}

function AchievementBadge({ achievement }) {
    const Icon = ACHIEVEMENT_ICONS[achievement.id] || Medal01Icon;
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border hover:border-primary/30 hover:bg-muted/80 transition-all cursor-default group"
            title={achievement.label}
        >
            <div className="p-2 rounded-lg bg-card border border-border group-hover:border-primary/20 group-hover:scale-110 transition-all">
                <HugeiconsIcon icon={Icon} size={24} color="currentColor" strokeWidth={1.5} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{achievement.label}</span>
        </motion.div>
    );
}

export default function ReputationBadge({ reputation, compact = false }) {
    if (!reputation) return null;

    const { score, trustLevel, trustTier, achievements, stats } = reputation;
    const cfg = TRUST_CONFIG[trustTier] || TRUST_CONFIG[1];
    const Icon = cfg.icon;
    const nextThreshold = NEXT_THRESHOLD[trustTier];
    const prevThreshold = trustTier === 1 ? 0 : NEXT_THRESHOLD[trustTier - 1];
    const progress = nextThreshold
        ? Math.min(100, ((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
        : 100;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                    <HugeiconsIcon icon={Icon} size={16} color="currentColor" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-xs font-bold text-foreground">{score} pts</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{trustLevel}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Score Card */}
            <div className={`rounded-xl border p-6 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Civic Reputation</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-black ${cfg.color}`}>{score}</span>
                            <span className="text-sm font-bold text-muted-foreground">pts</span>
                        </div>
                        <div className="mt-4">
                            <TrustLevelBadge tier={trustTier} />
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${cfg.bg} border-2 ${cfg.border} shadow-inner`}>
                        <HugeiconsIcon icon={Icon} size={48} color="currentColor" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Progress to next level */}
                {nextThreshold && (
                    <div className="mt-6 pt-6 border-t border-current/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <HugeiconsIcon icon={Medal01Icon} size={12} color="currentColor" strokeWidth={1.5} /> Progress to {TRUST_CONFIG[trustTier + 1]?.label}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">
                                {score} / {nextThreshold}
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${cfg.ring}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Issues', value: stats?.issuesReported ?? 0, icon: Flag01Icon },
                    { label: 'Comments', value: stats?.commentsPosted ?? 0, icon: Comment01Icon },
                    { label: 'Votes Cast', value: stats?.votesCast ?? 0, icon: Agreement01Icon },
                ].map((stat) => (
                    <div key={stat.label} className="border border-border rounded-lg p-4 bg-card text-center group">
                        <stat.icon size={16} className="mx-auto mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-2xl font-black text-foreground">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3 flex items-center gap-2">
                        <ChampionIcon size={12} /> Achievements
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {achievements.map((a) => (
                            <AchievementBadge key={a.id} achievement={a} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
