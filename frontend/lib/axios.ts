import axios from "axios";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PINATA_API_BASE_URL || "",
  headers: {
    Accept: "application/json",
  },
});

// set default header if available at startup
if (PINATA_JWT) {
  api.defaults.headers.common["Authorization"] = `Bearer ${PINATA_JWT}`;
}

api.interceptors.request.use(
  (config) => {
    const runtimeToken =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const token = PINATA_JWT || runtimeToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.set?.("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor: handle common response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Request unauthorized (401).");
    }
    return Promise.reject(error);
  }
);

export default api;
