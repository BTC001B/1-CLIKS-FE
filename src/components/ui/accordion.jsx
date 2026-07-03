import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AccordionRoot — manages a single openIndex so only one item is
 * open at a time.  It clones each AccordionItem child with
 * { index, openIndex, setOpenIndex } props.
 */
const AccordionRoot = ({ children, className = '' }) => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className={`accordion-root ${className}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { index, openIndex, setOpenIndex });
                }
                return child;
            })}
        </div>
    );
};

/**
 * AccordionItem — receives index / openIndex / setOpenIndex from
 * AccordionRoot, then passes isOpen / setIsOpen to its own children.
 */
const AccordionItem = ({ children, index, openIndex, setOpenIndex, className = '' }) => {
    const isOpen = openIndex === index;
    const setIsOpen = (value) => setOpenIndex(value ? index : null);

    return (
        <div
            className={`accordion-item ${className}`}
            data-state={isOpen ? 'open' : 'closed'}
            style={{
                borderBottom: '1px solid #E2E8F0',
            }}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { isOpen, setIsOpen });
                }
                return child;
            })}
        </div>
    );
};

const AccordionTrigger = ({ children, isOpen, setIsOpen, className = '' }) => {
    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`accordion-trigger ${className}`}
            aria-expanded={isOpen}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '1rem 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1E293B',
            }}
        >
            {children}
            <ChevronDown
                size={18}
                className="accordion-chevron"
                style={{
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: '#64748B',
                }}
            />
        </button>
    );
};

const AccordionContent = ({ children, isOpen, className = '' }) => {
    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    <div
                        className={`accordion-content ${className}`}
                        style={{
                            paddingBottom: '1rem',
                            paddingTop: '0.25rem',
                            color: '#64748B',
                            fontSize: '0.9rem',
                            lineHeight: 1.65,
                        }}
                    >
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
