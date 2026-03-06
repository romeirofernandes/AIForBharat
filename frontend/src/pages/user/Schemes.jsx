import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight01Icon as ArrowRight,
    Tick02Icon as Tick,
} from 'hugeicons-react';

const schemes = [
    { id: 1, name: 'PM Kisan Samman Nidhi', ministry: 'Agriculture', amount: '₹6,000/year', eligible: true, desc: 'Income support for small and marginal farmers' },
    { id: 2, name: 'Ayushman Bharat', ministry: 'Health', amount: '₹5,00,000', eligible: true, desc: 'Health insurance coverage for hospitalization' },
    { id: 3, name: 'PM Awas Yojana', ministry: 'Housing', amount: '₹2,50,000', eligible: false, desc: 'Financial assistance for building pucca house' },
    { id: 4, name: 'Ujjwala Yojana', ministry: 'Petroleum', amount: 'Free LPG', eligible: true, desc: 'Free LPG connection to BPL families' },
    { id: 5, name: 'Scholarship for Higher Education', ministry: 'Education', amount: '₹50,000/year', eligible: false, desc: 'Merit-based scholarship for undergraduate studies' },
    { id: 6, name: 'MUDRA Loan Yojana', ministry: 'Finance', amount: 'Up to ₹10L', eligible: true, desc: 'Collateral-free loans for micro-enterprises' },
];

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Schemes() {
    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">My Schemes</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Government welfare schemes matched to your civic profile</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemes.map((scheme, i) => (
                    <motion.div
                        key={scheme.id}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ delay: i * 0.05 }}
                        className={`border rounded-lg p-5 bg-card transition-all duration-300 group ${scheme.eligible ? 'border-chart-2/30 hover:border-chart-2/60 hover:shadow-lg hover:shadow-chart-2/5' : 'border-border opacity-60'}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{scheme.name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{scheme.ministry}</p>
                            </div>
                            {scheme.eligible && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-chart-2/10 text-chart-2 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                    <Tick size={12} /> Eligible
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-4">{scheme.desc}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">{scheme.amount}</span>
                            {scheme.eligible && (
                                <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer">
                                    Apply <ArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
