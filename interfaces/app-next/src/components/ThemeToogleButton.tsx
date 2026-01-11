'use client';

import { useTheme } from '@/contexts/theme/useTheme';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggleSwitch() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex items-center gap-3">
            <Sun className={`h-4 w-4 transition-colors ${isDark ? 'text-muted-foreground' : 'text-amber-500'}`} />
            <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
            />
            <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
        </div>
    );
}