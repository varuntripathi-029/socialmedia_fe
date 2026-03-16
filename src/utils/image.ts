import { API_BASE_URL } from '@/config/api';

export const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `${API_BASE_URL}${url}`;
};
