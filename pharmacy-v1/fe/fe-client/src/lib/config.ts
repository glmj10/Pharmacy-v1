const config = {
  appName: import.meta.env.VITE_APP_NAME || 'Pharmacy App',
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  isDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};

// Kiểm tra nhanh log ở môi trường Dev
if (config.isDebug) {
  console.log('App Config:', config);
}

export default config;