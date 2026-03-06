import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats } from '../../api/issues';
import {
    Alert02Icon as Issues,
    TaskDone01Icon as Resolved,
    UserMultiple02Icon as Users,
    Loading03Icon as Pending,
} from 'hugeicons-react';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getStats()
            .then((data) => setStats(data.stats))
            .catch(() => { });
    }, []);

    const cards = [
        { title: 'Total Issues', value: stats?.totalIssues ?? '—', icon: Issues, color: 'text-chart-1', bg: 'bg-chart-1/10' },
        { title: 'Pending', value: stats?.pendingIssues ?? '—', icon: Pending, color: 'text-chart-5', bg: 'bg-chart-5/10' },
        { title: 'Resolved', value: stats?.resolvedIssues ?? '—', icon: Resolved, color: 'text-chart-2', bg: 'bg-chart-2/10' },
        { title: 'Registered Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-chart-4', bg: 'bg-chart-4/10' },
    ];

    return (
        <div className="w-full space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Civic Intelligence system overview</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ delay: i * 0.08 }}
                        className="border border-border rounded-lg p-6 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                        <div className={`p-3 rounded-lg ${card.bg} w-fit mb-4`}>
                            <card.icon size={22} className={card.color} />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground mb-1">{card.value}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{card.title}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
