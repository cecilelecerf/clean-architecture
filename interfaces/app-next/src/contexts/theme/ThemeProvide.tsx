'use client';

import { useEffect, useState } from 'react';
import { ThemeContext, Theme } from './ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div data-theme={theme}>{children}</div>
        </ThemeContext.Provider>
    );
}
