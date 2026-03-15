import { create } from 'zustand';

interface ThemeState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: localStorage.getItem('darkMode') === 'true',

    toggleDarkMode: () => {
        set((state) => {
            const newMode = !state.isDarkMode;
            localStorage.setItem('darkMode', String(newMode));
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return { isDarkMode: newMode };
        });
    },

    initialize: () => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        set({ isDarkMode: isDark });
    },
}));
