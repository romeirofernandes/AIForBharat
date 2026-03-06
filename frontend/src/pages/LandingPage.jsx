import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Menu01Icon as Menu,
    Cancel01Icon as X,
    DatabaseIcon as Database,
    ArrowUpRight01Icon as TrendingUp,
    GlobalIcon as Globe,
    ArrowRight01Icon as ChevronRight,
    CodeIcon as Code,
    ChartHistogramIcon as Chart,
    File02Icon as File,
    UserCircleIcon as User,
    Tick02Icon as Tick
} from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/button';
import { AnimatedShieldCheck } from '../components/shield-check-icon';
import TextRotate from '../components/text-rotate';
import { HexagonBackground } from '../components/hexagon';

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
    const [textRotateIndex, setTextRotateIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setTextRotateIndex((prev) => (prev + 1) % 4);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center w-full bg-linear-to-b from-background to-muted/30">
            {/* Navbar Desktop & Mobile */}
            <header className={`fixed top-0 z-50 w-full border-b subtle-border transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background/80 backdrop-blur-sm'} px-6 md:px-12 lg:px-20 py-4`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between w-full">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">account_balance</span>
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-primary">Civic Intelligence</h2>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <nav className="flex items-center gap-8">
                            {['Solutions', 'Impact', 'Insights', 'Framework'].map((item) => (
                                <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    {item}
                                </button>
                            ))}
                        </nav>
                        <Button onClick={() => navigate('/login')} className="cursor-pointer gap-2 rounded-lg min-h-[44px]">
                            Login <ChevronRight size={16} />
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
                    className="fixed inset-0 z-40 bg-background pt-24 px-6 flex flex-col md:hidden"
                >
                    <nav className="flex flex-col gap-6 text-center mt-10">
                        {['Solutions', 'Impact', 'Insights', 'Framework'].map((item) => (
                            <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-xl font-bold uppercase tracking-widest text-primary cursor-pointer">
                                {item}
                            </button>
                        ))}
                        <Button onClick={() => navigate('/login')} variant="default" className="mt-8 w-full cursor-pointer rounded-lg gap-2 min-h-[44px]">
                            Login <ChevronRight size={18} />
                        </Button>
                    </nav>
                </motion.div>
            )}

            <main className="flex-1 w-full flex flex-col pt-20">

                {/* Hero Section */}
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
                            <Button onClick={() => navigate('/login')} className="group gap-2 cursor-pointer w-full sm:w-auto h-12 px-8 rounded-lg shadow-primary/25 shadow-lg relative overflow-hidden min-h-[44px]">
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <span className="relative flex items-center gap-2">Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                            </Button>
                            <Button onClick={() => scrollToSection('solutions')} variant="outline" className="cursor-pointer w-full sm:w-auto h-12 px-8 rounded-lg bg-background/50 backdrop-blur-md hover:bg-muted transition-colors min-h-[44px]">
                                How It Works
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Problem / Pillars Grid */}
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

                {/* Impact Stats */}
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

                {/* Insights Bento Grid */}
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

                {/* Vertical Workflow Timeline */}
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

                {/* CTA Section */}
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
                            <Button onClick={() => navigate('/login')} className="cursor-pointer w-full sm:w-auto h-14 px-10 rounded-lg text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform min-h-[44px]">
                                Get Full Access
                            </Button>
                            <Button onClick={() => scrollToSection('impact')} variant="outline" className="cursor-pointer w-full sm:w-auto h-14 px-10 rounded-lg text-lg bg-background hover:scale-[1.02] transition-transform min-h-[44px]">
                                View Platform Impact
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full px-6 md:px-12 lg:px-20 py-16 border-t subtle-border bg-background mt-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-6">

                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Civic Intelligence</h2>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-loose mb-10">
                                Institutional Framework for the Next Century of Governance. Built for Citizens, Powered by Open Intelligence.
                            </p>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">AI For Bharat</span>
                                    <span className="w-px h-3 bg-border"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">AWS</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Made by Team Mirror Family</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-12 lg:gap-24">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-8">Navigation</h4>
                                <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                    <li><button onClick={() => scrollToSection('solutions')} className="hover:text-primary transition-colors cursor-pointer">Solutions</button></li>
                                    <li><button onClick={() => scrollToSection('framework')} className="hover:text-primary transition-colors cursor-pointer">Protocol</button></li>
                                    <li><button onClick={() => scrollToSection('impact')} className="hover:text-primary transition-colors cursor-pointer">Impact</button></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-8">Access</h4>
                                <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                    <li><a href="#" className="hover:text-primary transition-colors cursor-pointer">Privacy</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors cursor-pointer">Terms</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors cursor-pointer">Status</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
