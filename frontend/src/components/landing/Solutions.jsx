import React from 'react';
import { motion } from 'framer-motion';

export function Solutions({ fadeInUp, staggerContainer }) {
    return (
        <section id="solutions" className="px-6 md:px-12 lg:px-20 py-20 lg:py-28 border-b subtle-border bg-muted/20 w-full scroll-mt-20">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="w-full max-w-7xl mx-auto flex flex-col"
            >
                <motion.h3 variants={fadeInUp} className="text-xs font-bold uppercase tracking-[0.2em] mb-12 opacity-50 text-muted-foreground text-center md:text-left">
                    Core Pillars
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-3 border subtle-border rounded-lg shadow-sm bg-background overflow-hidden relative">
                    <motion.div variants={fadeInUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r subtle-border bg-linear-to-br from-background to-muted/30 hover:to-primary/5 transition-colors group cursor-default">
                        <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">01</span>
                        <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">Linguistic Access</h3>
                        <p className="text-sm md:text-base leading-relaxed text-muted-foreground font-medium">
                            Report grievances in your mother tongue. Our AI structures vernacular voice inputs for instant government triage.
                        </p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r subtle-border bg-linear-to-br from-background to-muted/30 hover:to-primary/5 transition-colors group cursor-default">
                        <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">02</span>
                        <h4 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">Welfare Discovery</h4>
                        <p className="text-sm md:text-base leading-relaxed text-muted-foreground font-medium">
                            No more searching for schemes. Our matching engine discovers your eligibility for state and central benefits based on your civic profile.
                        </p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="p-8 md:p-10 bg-linear-to-br from-background to-muted/30 hover:to-primary/5 transition-colors group cursor-default">
                        <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">03</span>
                        <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">Public Entitlement</h3>
                        <p className="text-sm md:text-base leading-relaxed text-muted-foreground font-medium">
                            Real-time tracking of public spending and project completion in your ward, ensuring every rupee of the budget reaches the desk it was meant for.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
