import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        try {
            const stored = localStorage.getItem(THEME_KEY) as Theme | null;
            if (stored === 'dark' || stored === 'light') {
                setThemeState(stored);
                applyThemeClass(stored);
                return;
            }

            // Fallback to system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = prefersDark ? 'dark' : 'light';
            setThemeState(initial);
            applyThemeClass(initial);
        } catch (err) {
            // ignore
        }
    }, []);

    const applyThemeClass = (t: Theme) => {
        const root = document.documentElement;
        if (!root) return;
        if (t === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        try {
            localStorage.setItem(THEME_KEY, t);
        } catch {
            // ignore storage errors
        }
        applyThemeClass(t);
    };

    const toggleTheme = () => {
        setThemeState((prev) => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(THEME_KEY, next);
            } catch {
                // ignore storage errors
            }
            applyThemeClass(next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

export default ThemeContext;
