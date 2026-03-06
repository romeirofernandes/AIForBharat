import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RichButton } from '../ui/rich-button';

export function CTA({ fadeInUp, staggerContainer, scrollToSection }) {
    const navigate = useNavigate();

    return (
        <section className="px-6 py-28 md:py-40 flex flex-col items-center text-center w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-primary/5 -z-10"></div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-3xl mx-auto space-y-8">
                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-tight text-foreground">
                    Ready for Public Impact?
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl max-w-xl mx-auto text-muted-foreground leading-relaxed font-medium">
                    Join thousands of citizens making Bharat better. Get started with the AI civic layer today.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                    <RichButton onClick={() => navigate('/login')} color="primary" size="lg" className="w-full sm:w-auto px-10">
                        Get Full Access
                    </RichButton>
                    <RichButton onClick={() => scrollToSection('impact')} color="default" size="lg" className="w-full sm:w-auto px-10">
                        View Platform Impact
                    </RichButton>
                </motion.div>
            </motion.div>
        </section>
    );
}
