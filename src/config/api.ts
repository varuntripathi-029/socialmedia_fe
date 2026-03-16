const PROD_API_BASE_URL = 'https://socialmediabe-production-9323.up.railway.app';
const DEV_API_BASE_URL = 'http://localhost:8080';

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL);
