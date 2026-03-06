import React from 'react';
import { motion } from 'framer-motion';
import { DatabaseIcon as Database, ArrowUpRight01Icon as TrendingUp, GlobalIcon as Globe } from 'hugeicons-react';

export function Impact({ fadeInUp, staggerContainer }) {
    return (
        <section id="impact" className="px-6 md:px-12 lg:px-20 py-24 lg:py-32 w-full max-w-7xl mx-auto scroll-mt-20">
            <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="lg:w-1/2 space-y-8"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tighter leading-tight text-foreground">
                        Empowering the Last Mile.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                        Civic Intelligence isn't just a dashboard—it's a lifeline. By integrating with India Stack, we ensure that every citizen, regardless of their tech-literacy or language, can access their rights with dignity.
                    </motion.p>
                    <motion.ul variants={staggerContainer} className="space-y-6 pt-6 border-t subtle-border">
                        {[
                            { text: "Vernacular voice-to-grievance structuring using Bhashini.", icon: <Database className="text-primary w-6 h-6" /> },
                            { text: "Proactive AI-matching for 500+ Central and State schemes.", icon: <TrendingUp className="text-primary w-6 h-6" /> },
                            { text: "Automated escalation logic for delayed civic resolutions.", icon: <Globe className="text-primary w-6 h-6" /> }
                        ].map((item, index) => (
                            <motion.li variants={fadeInUp} key={index} className="flex items-start gap-4 p-4 hover:bg-muted border border-transparent hover:border-border rounded-lg transition-colors cursor-default">
                                <div className="p-3 border subtle-border rounded-lg bg-background shadow-sm text-primary">{item.icon}</div>
                                <span className="text-sm md:text-base font-bold text-foreground leading-relaxed tracking-wide pt-1">{item.text}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="lg:w-1/2 w-full grid grid-cols-2 gap-px bg-border border subtle-border shadow-lg shadow-primary/5 rounded-lg overflow-hidden"
                >
                    {[
                        { number: "98%", label: "Data Accuracy" },
                        { number: "420k", label: "Records Scanned" },
                        { number: "15ms", label: "Latency Rate" },
                        { number: "124", label: "Active Cities" }
                    ].map((stat, i) => (
                        <motion.div variants={fadeInUp} key={i} className="bg-background p-10 md:p-14 flex flex-col justify-center items-center text-center hover:bg-muted/50 transition-colors duration-300">
                            <span className="text-4xl md:text-5xl font-bold text-primary mb-3">{stat.number}</span>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
