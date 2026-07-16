import { create } from 'zustand';

interface ThemeState {
    isDarkMode: boolean;
    initialize: () => void;
}

export const useThemeStore = create<ThemeState>(() => ({
    isDarkMode: true,

    initialize: () => {
        document.documentElement.classList.add('dark');
    },
}));
