const API_URL = import.meta.env.VITE_API_URL;
const API_PATH = `${API_URL}/api`;

export const getApiUrl = (path: string) => `${API_PATH}${path}`;
