import axios from "axios";
import { BASE_URL } from "./apiPaths.js";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur des requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur des réponses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || "";
    const sentAuthorization = error.config?.headers?.Authorization;
    const isPublicAuthRequest = /\/auth\/(login|register)(?:[/?]|$)/i.test(
      requestUrl,
    );

    // Une réponse 401 à une requête protégée invalide la session locale.
    // Les erreurs d'identifiants sur login/register ne déclenchent pas cette action.
    if (
      error.response?.status === 401 &&
      sentAuthorization &&
      !isPublicAuthRequest
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:session-expired"));
    }

    if (error.response) {
      if (error.response.status === 500) {
        console.error("Erreur serveur. Veuillez réessayer plus tard.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Délai d’attente dépassé. Veuillez réessayer.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
