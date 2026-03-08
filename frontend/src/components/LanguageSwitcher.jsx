import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSkillIcon as LangIcon } from 'hugeicons-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी' },
  { code: 'mni-Mtei', label: 'Manipuri', native: 'মৈতৈলোন্' },
];

function triggerGoogleTranslate(langCode) {
  // Google Translate uses a cookie to change the page language
  const frame = document.querySelector('.goog-te-menu-frame');
  if (frame) {
    const items = frame.contentDocument?.querySelectorAll('.goog-te-menu2-item span.text');
    if (items) {
      for (const item of items) {
        if (item.textContent.trim().toLowerCase() === langCode.toLowerCase()) {
          item.click();
          return;
        }
      }
    }
  }

  // Fallback: set the cookie directly and reload
  if (langCode === 'en') {
    // Reset to original language
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
    window.location.reload();
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
    window.location.reload();
  }
}

/**
 * LanguageSwitcher
 * @param {object} props
 * @param {'sidebar' | 'navbar'} props.variant - 'sidebar' for dashboard sidebars, 'navbar' for landing page
 * @param {boolean} props.collapsed - sidebar collapsed state (only used when variant='sidebar')
 */
export default function LanguageSwitcher({ variant = 'navbar', collapsed = false }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  // Detect current language from cookie
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match?.[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelect = (lang) => {
    setCurrentLang(lang.code);
    setOpen(false);
    triggerGoogleTranslate(lang.code);
  };

  // ─── Sidebar variant ───────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:bg-primary/10 hover:text-sidebar-foreground transition-all duration-200 w-full cursor-pointer"
          aria-label="Change Language"
          title="Change Language"
        >
          <LangIcon size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden flex items-center gap-2"
              >
                <span>{selected.native}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`absolute ${collapsed ? 'left-full ml-2 bottom-0' : 'bottom-full mb-2 left-0 right-0'} z-50`}
            >
              <div className="bg-sidebar border border-sidebar-border rounded-md shadow-xl max-h-56 overflow-y-auto min-w-[180px] custom-scrollbar">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer
                      ${lang.code === currentLang
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                  >
                    <span className="truncate">{lang.native}</span>
                    <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wider ml-2">
                      {lang.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Navbar variant ────────────────────────────────────────
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
        aria-label="Change Language"
      >
        <LangIcon size={16} className="shrink-0" />
        <span>{selected.native}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 right-0 z-50"
          >
            <div className="bg-background border border-border rounded-md shadow-xl max-h-64 overflow-y-auto min-w-[200px] backdrop-blur-xl custom-scrollbar">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer
                    ${lang.code === currentLang
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                    }`}
                >
                  <span className="truncate">{lang.native}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-3">
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
