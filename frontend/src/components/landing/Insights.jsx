import React from 'react';
import { motion } from 'framer-motion';
import { ChartHistogramIcon as Chart, File02Icon as File, UserCircleIcon as User, Tick02Icon as Tick } from 'hugeicons-react';

export function Insights({ fadeInUp, staggerContainer }) {
    return (
        <section id="insights" className="px-6 md:px-12 lg:px-20 py-20 lg:py-32 border-t subtle-border bg-muted/10 w-full scroll-mt-20">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="w-full max-w-7xl mx-auto flex flex-col"
            >
                <motion.h3 variants={fadeInUp} className="text-xs font-bold uppercase tracking-[0.2em] mb-12 opacity-50 text-muted-foreground text-center md:text-left">
                    System Insights
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-4 pb-2">
                    <motion.div variants={fadeInUp} className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 p-8 md:p-10 border subtle-border rounded-lg bg-linear-to-br from-background to-muted/30 shadow-sm flex flex-col justify-between group cursor-default relative overflow-hidden">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-4 bg-primary/10 w-fit rounded-lg group-hover:bg-primary/20 transition-colors text-primary">
                                    <Chart size={40} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Live Analytics</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-10">
                                {['Ward Analytics', 'Budget Allocation', 'Predictive AI', 'SLA Tracking'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-background border subtle-border rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:border-primary/30 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Mock Chart Visualization */}
                            <div className="flex items-end gap-2 h-20 mb-12 px-2 border-b subtle-border pb-1">
                                {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        className="flex-1 bg-primary/20 group-hover:bg-primary/40 rounded-t-sm transition-colors"
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-tight text-foreground">Data-Driven Administration</h3>
                            <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-medium">
                                Analyze grievance trends at the ward level. Predict civic issues before they escalate and allocate budgets dynamically.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="col-span-1 md:col-span-2 p-8 border subtle-border rounded-lg bg-primary text-primary-foreground shadow-sm flex flex-col justify-end group cursor-default relative overflow-hidden">
                        <div className="absolute top-8 right-8 text-primary-foreground/50 group-hover:text-primary-foreground/80 transition-colors">
                            <File size={32} />
                        </div>
                        <h4 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight z-10">Smart Drafting</h4>
                        <p className="text-sm md:text-base leading-relaxed text-primary-foreground/90 font-medium z-10 max-w-sm">
                            AI generates official applications automatically derived from vocal intent securely without manual data entry.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="col-span-1 md:col-span-1 p-8 border subtle-border rounded-lg bg-background shadow-sm flex flex-col justify-end group cursor-default">
                        <div className="mb-6 text-primary">
                            <Tick size={24} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-tight text-foreground">Verified Identity</h3>
                        <p className="text-xs md:text-sm leading-relaxed text-muted-foreground font-medium">
                            Aadhaar integration ensures robust Sybil resistance.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="col-span-1 md:col-span-1 p-8 border subtle-border rounded-lg bg-background shadow-sm flex flex-col justify-end group cursor-default">
                        <div className="mb-6 text-primary">
                            <User size={24} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-tight text-foreground">Agentic Layer</h3>
                        <p className="text-xs md:text-sm leading-relaxed text-muted-foreground font-medium">
                            24/7 AI assistance mimicking human-like empathy.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
