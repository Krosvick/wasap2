const API_URL = process.env.DEVELOPMENT_API_URL;

export const getApiUrl = (path: string) => `${API_URL}${path}`;
