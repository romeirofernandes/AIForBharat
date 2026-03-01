import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function TextRotate({
    texts,
    mainClassName = "",
    splitBy = "characters",
    staggerDuration = 0.025,
    staggerFrom = "first",
    initial = { y: "100%" },
    animate = { y: 0 },
    exit = { y: "-120%" },
    transition = { type: "spring", damping: 30, stiffness: 400 },
    rotationInterval = 2000,
    splitLevelClassName = "",
    elementLevelClassName = "",
    activeIndex = null,
    onNext = null
}) {
    const [internalIndex, setInternalIndex] = useState(0);
    const index = activeIndex !== null ? activeIndex : internalIndex;

    useEffect(() => {
        if (activeIndex !== null) return;
        const interval = setInterval(() => {
            setInternalIndex((current) => (current + 1) % texts.length);
            if (onNext) onNext((index + 1) % texts.length);
        }, rotationInterval);
        return () => clearInterval(interval);
    }, [texts, rotationInterval, activeIndex, onNext, index]);

    const splittedText = useMemo(() => {
        const text = texts[index];
        if (splitBy === "characters") {
            return text.split("");
        }
        if (splitBy === "words") {
            return text.split(" ");
        }
        return [text];
    }, [texts, index, splitBy]);

    return (
        <span className={cn("relative inline-flex overflow-hidden pb-2 pt-2", mainClassName)}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    className={cn("flex flex-wrap whitespace-pre", splitLevelClassName)}
                    layout
                >
                    {splittedText.map((item, i) => (
                        <span key={`${index}-${i}`} className={cn("inline-block overflow-hidden", elementLevelClassName)}>
                            <motion.span
                                initial={initial}
                                animate={animate}
                                exit={exit}
                                transition={{
                                    ...transition,
                                    delay: staggerFrom === "last" ? (splittedText.length - 1 - i) * staggerDuration : i * staggerDuration
                                }}
                                className="inline-block"
                            >
                                {item === " " ? "\u00A0" : item}
                            </motion.span>
                            {splitBy === "words" && i !== splittedText.length - 1 && <span>{"\u00A0"}</span>}
                        </span>
                    ))}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
