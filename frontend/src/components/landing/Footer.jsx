import React from 'react';

export function Footer({ scrollToSection }) {
    return (
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
    );
}
