import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight01Icon as ChevronRight } from 'hugeicons-react';
import { RichButton } from '../ui/rich-button';
import { HexagonBackground } from '../../components/hexagon';
import TextRotate from '../../components/text-rotate';

export function Hero({ textRotateIndex, scrollToSection, fadeInUp, staggerContainer }) {
    const navigate = useNavigate();

    return (
        <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32 lg:py-40 flex flex-col items-center text-center border-b subtle-border w-full relative overflow-hidden">
            <HexagonBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-lg blur-[100px] -z-10 pointer-events-none"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-[850px] mx-auto w-full"
            >
                <motion.h1 variants={fadeInUp} tabIndex={-1} className="focus:outline-none text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.2] md:leading-[1.3] tracking-tighter text-foreground mb-8 uppercase text-center flex flex-col items-center">
                    <span>Bridging the Gap Between</span>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-5 gap-y-4 mt-2 md:mt-4">
                        <TextRotate
                            texts={["Policy", "People", "Tech", "Trust"]}
                            mainClassName="text-white px-3 sm:px-4 md:px-5 bg-primary overflow-hidden py-1 sm:py-2 md:py-2 justify-center rounded-lg align-middle inline-flex"
                            staggerFrom={"last"}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            activeIndex={textRotateIndex}
                        />
                        <span className="text-2xl md:text-4xl lg:text-5xl lowercase text-muted-foreground pt-1">and</span>
                        <TextRotate
                            texts={["People", "Tech", "Trust", "Policy"]}
                            mainClassName="text-primary px-3 sm:px-4 md:px-5 bg-primary/10 overflow-hidden py-1 sm:py-2 md:py-2 justify-center rounded-lg align-middle inline-flex"
                            staggerFrom={"last"}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            activeIndex={textRotateIndex}
                        />
                    </div>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-12">
                    The unified AI layer for Bharat. Proactively discover welfare eligibility, report grievances in your own language, and track government action with radical transparency.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                    <RichButton onClick={() => navigate('/login')} color="primary" size="lg" className="w-full sm:w-auto px-8">
                        Get Started <ChevronRight size={16} />
                    </RichButton>
                    <RichButton onClick={() => scrollToSection('solutions')} color="default" size="lg" className="w-full sm:w-auto px-8">
                        How It Works
                    </RichButton>
                </motion.div>
            </motion.div>
        </section>
    );
}
