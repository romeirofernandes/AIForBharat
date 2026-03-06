import React from 'react';
import { motion } from 'framer-motion';

export function Framework({ fadeInUp, staggerContainer }) {
    return (
        <section id="framework" className="px-6 md:px-12 lg:px-20 py-20 lg:py-32 border-t subtle-border bg-primary/5 w-full flex justify-center scroll-mt-20">
            <div className="w-full max-w-7xl relative pl-0 md:pl-20">
                <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-16 opacity-50 text-muted-foreground text-center md:text-left"
                >
                    Protocol Workflow
                </motion.h3>
                <div className="max-w-2xl mx-auto md:mx-0 flex flex-col relative w-full">
                    {/* Timeline Line */}
                    <div className="absolute left-[27px] md:left-[35px] top-6 bottom-6 w-px bg-primary/20"></div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
                        {[
                            { step: "01", title: "Profile", desc: "Create your lifetime civic identity with secure Aadhaar-based verification." },
                            { step: "02", title: "Discover", desc: "AI scans the welfare landscape to find schemes you didn't know you qualified for." },
                            { step: "03", title: "Report", desc: "Speak or type your grievance. AI categorizes and routes it to the right department." },
                            { step: "04", title: "Resolve", desc: "Track progress and auto-escalate if the resolution misses its SLA deadline.", highlight: true },
                        ].map((item, i) => (
                            <motion.div variants={fadeInUp} key={i} className={`relative pl-16 md:pl-28 ${i !== 3 ? 'pb-16' : ''}`}>
                                <div className={`absolute left-0 top-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border subtle-border rounded-lg z-10 shadow-sm transition-transform duration-300 hover:scale-105
              ${item.highlight ? 'bg-primary text-primary-foreground border-transparent shadow-md' : 'bg-background text-primary'}`}>
                                    <span className="text-sm md:text-base font-black font-mono">{item.step}</span>
                                </div>
                                <h4 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-3 pt-3 md:pt-4 text-foreground">{item.title}</h4>
                                <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
