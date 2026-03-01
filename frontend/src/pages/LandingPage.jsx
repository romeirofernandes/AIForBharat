import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Database, TrendingUp, Users, ShieldCheck, Globe, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center w-full">
            {/* Navbar Desktop & Mobile */}
            <header className={`fixed top-0 z-50 w-full border-b paper-border transition-all duration-300 ${scrolled ? 'bg-background-light/95 backdrop-blur-md shadow-sm' : 'bg-background-light/80 backdrop-blur-sm'} px-6 md:px-12 lg:px-20 py-4`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between w-full">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">account_balance</span>
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-primary">Civic Intelligence</h2>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <nav className="flex items-center gap-8">
                            {['Solutions', 'Framework', 'Impact', 'Insights'].map((item) => (
                                <a key={item} className="text-xs font-semibold uppercase tracking-wider text-text-main/70 hover:text-primary transition-colors" href={`#${item.toLowerCase()}`}>
                                    {item}
                                </a>
                            ))}
                        </nav>
                        <Button variant="outline" size="sm" className="bg-white/50 cursor-pointer">
                            Request Demo
                        </Button>
                    </div>

                    <button className="md:hidden p-2 text-primary focus:outline-none cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed inset-0 z-40 bg-background-light pt-24 px-6 flex flex-col md:hidden"
                >
                    <nav className="flex flex-col gap-6 text-center mt-10">
                        {['Solutions', 'Framework', 'Impact', 'Insights'].map((item) => (
                            <a key={item} className="text-xl font-bold uppercase tracking-widest text-primary" href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)}>
                                {item}
                            </a>
                        ))}
                        <Button variant="outline" className="mt-8 w-full bg-white/50 hover:bg-primary hover:text-white cursor-pointer">
                            Request Demo
                        </Button>
                    </nav>
                </motion.div>
            )}

            <main className="flex-1 w-full flex flex-col pt-20">

                {/* Hero Section */}
                <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32 lg:py-40 flex flex-col items-center text-center border-b paper-border w-full">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-[850px] mx-auto w-full"
                    >
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter text-primary mb-8 uppercase">
                            Bridging the Gap Between Policy and People.
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-text-main/80 max-w-3xl mx-auto mb-12">
                            The unified AI layer for Bharat. Proactively discover welfare eligibility, report grievances in your own language, and track government action with radical transparency.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button className="group gap-2 cursor-pointer w-full sm:w-auto">
                                Initialize Platform <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" className="cursor-pointer w-full sm:w-auto">
                                Read Documentation
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Problem / Pillars Grid */}
                <section id="solutions" className="px-6 md:px-12 lg:px-20 py-20 lg:py-28 border-b paper-border bg-white/30 w-full">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="w-full max-w-7xl mx-auto flex flex-col"
                    >
                        <motion.h3 variants={fadeInUp} className="text-xs font-bold uppercase tracking-[0.2em] mb-12 opacity-50 text-center md:text-left">
                            Core Pillars
                        </motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 border-t paper-border rounded-xl md:rounded-none md:border-none shadow-sm md:shadow-none bg-background-light md:bg-transparent overflow-hidden">
                            <motion.div variants={fadeInUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r md:border-t paper-border bg-white/40 md:bg-transparent hover:bg-white/60 transition-colors">
                                <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">01</span>
                                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">Linguistic Access</h3>
                                <p className="text-sm md:text-base leading-relaxed text-text-main/80 font-medium">
                                    Report grievances in your mother tongue. Our Bhashini-powered AI structures vernacular voice inputs for instant government triage.
                                </p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r md:border-t paper-border bg-white/40 md:bg-transparent hover:bg-white/60 transition-colors">
                                <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">02</span>
                                <h4 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">Welfare Discovery</h4>
                                <p className="text-sm md:text-base leading-relaxed text-text-main/80 font-medium">
                                    No more searching for schemes. Our matching engine discovers your eligibility for state and central benefits based on your civic profile.
                                </p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="p-8 md:p-10 md:border-t paper-border bg-white/40 md:bg-transparent hover:bg-white/60 transition-colors">
                                <span className="text-5xl font-light text-primary/20 mb-8 block font-mono">03</span>
                                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">Public Entitlement</h3>
                                <p className="text-sm md:text-base leading-relaxed text-text-main/80 font-medium">
                                    Real-time tracking of public spending and project completion in your ward, ensuring every rupee of the budget reaches the desk it was meant for.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* Impact Stats */}
                <section id="impact" className="px-6 md:px-12 lg:px-20 py-24 lg:py-32 w-full max-w-7xl mx-auto">
                    <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="lg:w-1/2 space-y-8"
                        >
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tighter leading-tight">
                                Empowering the Last Mile.
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-base md:text-lg text-text-main/80 leading-relaxed font-medium">
                                Civic Intelligence isn't just a dashboard—it's a lifeline. By integrating with India Stack, we ensure that every citizen, regardless of their tech-literacy or language, can access their rights with dignity.
                            </motion.p>
                            <motion.ul variants={staggerContainer} className="space-y-6 pt-6 border-t paper-border">
                                {[
                                    { text: "Vernacular voice-to-grievance structuring using Bhashini.", icon: <Database className="text-primary w-6 h-6" /> },
                                    { text: "Proactive AI-matching for 500+ Central and State schemes.", icon: <TrendingUp className="text-primary w-6 h-6" /> },
                                    { text: "Automated escalation logic for delayed civic resolutions.", icon: <Globe className="text-primary w-6 h-6" /> }
                                ].map((item, index) => (
                                    <motion.li variants={fadeInUp} key={index} className="flex items-start gap-4 p-4 hover:bg-white/40 rounded-xl transition-colors">
                                        <div className="p-3 border paper-border rounded-lg bg-white shadow-sm">{item.icon}</div>
                                        <span className="text-sm md:text-base font-bold text-text-main leading-relaxed tracking-wide pt-1">{item.text}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="lg:w-1/2 w-full grid grid-cols-2 gap-px bg-border-muted border paper-border shadow-md rounded-xl overflow-hidden"
                        >
                            {[
                                { number: "98%", label: "Data Accuracy" },
                                { number: "420k", label: "Records Scanned" },
                                { number: "15ms", label: "Latency Rate" },
                                { number: "124", label: "Active Cities" }
                            ].map((stat, i) => (
                                <motion.div variants={fadeInUp} key={i} className="bg-background-light p-10 md:p-14 flex flex-col justify-center items-center text-center hover:bg-white transition-colors duration-300">
                                    <span className="text-4xl md:text-5xl font-bold text-primary mb-3">{stat.number}</span>
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-text-main/60">{stat.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Vertical Workflow Timeline */}
                <section id="framework" className="px-6 md:px-12 lg:px-20 py-20 lg:py-32 border-t border-b paper-border bg-white/20 w-full flex justify-center">
                    <div className="w-full max-w-7xl relative pl-0 md:pl-20">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.2em] mb-16 opacity-50 text-center md:text-left"
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
                                        <div className={`absolute left-0 top-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border paper-border rounded-full z-10 shadow-sm
                      ${item.highlight ? 'bg-primary text-white border-transparent shadow-md' : 'bg-background-light text-primary'}`}>
                                            <span className="text-sm md:text-base font-black font-mono">{item.step}</span>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-3 pt-3 md:pt-4">{item.title}</h4>
                                        <p className="text-sm md:text-base text-text-main/80 max-w-md leading-relaxed font-medium">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-28 md:py-40 flex flex-col items-center text-center w-full bg-cover">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-3xl mx-auto space-y-8">
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-tight text-primary">
                            Ready for Public Impact?
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-base md:text-lg lg:text-xl max-w-xl mx-auto text-text-main/80 leading-relaxed font-medium">
                            Join thousands of citizens making Bharat better. Get started with the AI civic layer today.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                            <Button className="w-full sm:w-auto">
                                Request Full Demo
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto">
                                View API Docs
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full px-6 md:px-12 lg:px-20 py-16 border-t paper-border bg-white/40 mt-auto backdrop-blur-sm">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start lg:items-end gap-12">

                        <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-6 cursor-pointer">
                                <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Civic Intelligence Platform</h2>
                            </div>
                            <p className="text-[11px] font-medium text-text-main/60 uppercase tracking-widest leading-loose">
                                Institutional Framework for the Next Century of Governance. <br className="hidden md:block" />
                                Built for Citizens, Powered by Open Intelligence.
                            </p>
                        </div>

                        <div className="flex gap-12 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
                            <div className="flex flex-col gap-4">
                                <a className="hover:text-black transition-colors" href="#">Privacy Protocol</a>
                                <a className="hover:text-black transition-colors" href="#">Terms of Access</a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <a className="hover:text-black transition-colors" href="#">API Docs</a>
                                <a className="hover:text-black transition-colors" href="#">System Status</a>
                            </div>
                        </div>

                    </div>

                    <div className="mt-16 pt-8 border-t paper-border flex flex-col-reverse justify-between items-center sm:flex-row gap-6">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-text-main/40">© 2024 CIP Institutional</span>
                        <div className="flex gap-6">
                            <Globe className="w-5 h-5 text-text-main/40 hover:text-primary transition-colors cursor-pointer" />
                            <ShieldCheck className="w-5 h-5 text-text-main/40 hover:text-primary transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
