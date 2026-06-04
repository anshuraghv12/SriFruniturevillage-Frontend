import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { Store } from "./store/Store.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import axios from "axios";

import { API_CONFIG } from "./utils/constants.js";

// ✅ Configure axios baseURL globally for all API calls
const API_BASE_URL = API_CONFIG.BASE_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = API_CONFIG.DEFAULT_TIMEOUT;
axios.defaults.withCredentials = false;

// Global runtime error handling for mobile browsers
window.addEventListener('error', (event) => {
  console.error('Global runtime error:', event.message || event.error || event.filename, event.error || event);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// ✅ Request interceptor - Add auth token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

console.log('🌐 Frontend API Base URL:', API_BASE_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Cannot start React app.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={Store}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Load Meta Pixel (Facebook) dynamically and safely (won't run on localhost)
;(function loadFacebookPixel(){
  try{
    if (/localhost|127\.0\.0\.1/.test(window.location.hostname)) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    s.onload = function(){
      try{
        window.fbq = window.fbq || function(){
          window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
        };
        if(!window._fbq) window._fbq = window.fbq;
        window.fbq.push = window.fbq;
        window.fbq.loaded = true;
        window.fbq.version = '2.0';
        window.fbq.queue = window.fbq.queue || [];
        window.fbq('init', '4359575050945086');
        window.fbq('track', 'PageView');
      }catch(e){console.warn('FB Pixel init failed', e)}
    };
    document.head.appendChild(s);
  }catch(e){console.warn('FB Pixel loader error', e)}
})();