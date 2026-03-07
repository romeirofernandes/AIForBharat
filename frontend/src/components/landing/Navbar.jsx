import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu01Icon as Menu, Cancel01Icon as X, ArrowRight01Icon as ChevronRight } from 'hugeicons-react';
import { RichButton } from '../ui/rich-button';

export function Navbar({ scrolled, isMobileMenuOpen, setIsMobileMenuOpen, scrollToSection }) {
    const navigate = useNavigate();

    return (
        <>
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
                        <RichButton onClick={() => navigate('/login')} color="primary" size="default">
                            Login <ChevronRight size={16} />
                        </RichButton>
                    </div>

                    <button className="md:hidden p-2 text-primary focus:outline-none cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

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
                        <RichButton onClick={() => navigate('/login')} color="default" size="lg" className="mt-8 w-full">
                            Login <ChevronRight size={18} />
                        </RichButton>
                    </nav>
                </motion.div>
            )}
        </>
    );
}
