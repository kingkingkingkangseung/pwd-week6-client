import axios from 'axios';
import { apiUrl, apiPrefix } from '../config/environment';

// Axios 인스턴스
const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  withCredentials: true, // 세션/쿠키 전달
});

api.interceptors.request.use(
  (config) => {
    if (import.meta?.env?.DEV) {
      console.log('API 요청:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta?.env?.DEV) {
      console.error('API 에러:', error);
    }
    return Promise.reject(error);
  },
);

// 내부 헬퍼: 경로 후보들을 순차 시도 (prefix 유무 포함)
const requestWithCandidates = async (method, paths, payload) => {
  let lastError;
  for (const p of paths) {
    const urls = [
      `${apiPrefix}${p}`,
      p,
    ];
    for (const url of urls) {
      try {
        if (method === 'get' && payload && payload.params) {
          return await api.get(url, { params: payload.params });
        }
        return await api[method](url, payload);
      } catch (err) {
        lastError = err;
        if (err?.response?.status && err.response.status !== 404) {
          throw err;
        }
      }
    }
  }
  throw lastError;
};

export const restaurantAPI = {
  // 목록
  getRestaurants: async () => requestWithCandidates('get', ['/restaurants']),

  // 상세
  getRestaurantById: async (id) => requestWithCandidates('get', [`/restaurants/${id}`]),

  // 인기
  getPopularRestaurants: async () => {
    try {
      return await requestWithCandidates('get', ['/restaurants/popular']);
    } catch (err) {
      const list = await requestWithCandidates('get', ['/restaurants']);
      const sorted = [...(list?.data || [])].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return { data: sorted.slice(0, 5) };
    }
  },

  // 생성/수정/삭제
  createRestaurant: async (payload) => requestWithCandidates('post', ['/restaurants'], payload),
  updateRestaurant: async (id, payload) => requestWithCandidates('put', [`/restaurants/${id}`], payload),
  deleteRestaurant: async (id) => requestWithCandidates('delete', [`/restaurants/${id}`]),
};

export const submissionAPI = {
  listSubmissions: async (status) => {
    const params = {};
    if (status && status !== 'all') params.status = status;
    return requestWithCandidates('get', ['/submissions'], { params });
  },
  updateSubmission: async (id, payload) => requestWithCandidates('put', [`/submissions/${id}`], payload),
  deleteSubmission: async (id) => requestWithCandidates('delete', [`/submissions/${id}`]),
};

export default api;
