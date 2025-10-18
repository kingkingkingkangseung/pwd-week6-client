// src/config/environment.js
const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  const config = {
    development: {
      apiUrl: 'http://localhost:5000',
      clientUrl: 'http://localhost:5173',
    },
    production: {
      apiUrl:
        // 우선순위: VITE_API_URL > 기본값
        import.meta.env.VITE_API_URL ??
        'https://pwd-week6-server.onrender.com',
      clientUrl:
        import.meta.env.VITE_CLIENT_URL ??
        'https://pwd-week6-client.vercel.app',
    },
  };

  // 환경변수가 있을 경우 우선 적용
  if (import.meta.env.VITE_API_URL) {
    config.development.apiUrl = import.meta.env.VITE_API_URL;
    config.production.apiUrl = import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.VITE_CLIENT_URL) {
    config.development.clientUrl = import.meta.env.VITE_CLIENT_URL;
    config.production.clientUrl = import.meta.env.VITE_CLIENT_URL;
  }

  return isDevelopment ? config.development : config.production;
};

const env = getEnvironmentConfig();
export default env;

// Named export
export const { apiUrl, clientUrl } = env;

// ✅ 개발환경에서만 로그
if (import.meta.env.DEV) {
  console.log('🌍 Environment Config:', {
    mode: import.meta.env.MODE,
    apiUrl: env.apiUrl,
    clientUrl: env.clientUrl,
  });
}
