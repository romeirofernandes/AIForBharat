import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Solutions } from '../components/landing/Solutions';
import { Impact } from '../components/landing/Impact';
import { Insights } from '../components/landing/Insights';
import { Framework } from '../components/landing/Framework';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

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
            <Navbar
                scrolled={scrolled}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                scrollToSection={scrollToSection}
            />

            <main className="flex-1 w-full flex flex-col pt-20">
                <Hero
                    textRotateIndex={textRotateIndex}
                    scrollToSection={scrollToSection}
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                />

                <Solutions
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                />

                <Impact
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                />

                <Insights
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                />

                <Framework
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                />

                <CTA
                    fadeInUp={fadeInUp}
                    staggerContainer={staggerContainer}
                    scrollToSection={scrollToSection}
                />
            </main>

            <Footer scrollToSection={scrollToSection} />
        </div>
    );
}
