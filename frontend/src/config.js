//should be used to differ the links in prod from those used in dev by the vite server.
const config = {
  apiUrl: import.meta.env.PROD 
    ? '/api'  // Relative path when served from Django
    : '/api'  // Will be proxied in dev via Vite config
};

export default config;