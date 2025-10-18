// 기존 api.jsx에서 api 인스턴스를 가져와서 사용
import api from './api';
import { apiUrl, apiPrefix } from '../config/environment';

// 서버 URL 설정 (환경별 자동 감지)
const API_BASE_URL = apiUrl;

// 내부 헬퍼: prefix 유무 자동 처리
const tryWithPrefixFallback = async (method, pathNoPrefix, payload) => {
  const urlWith = `${apiPrefix}${pathNoPrefix}`;
  try {
    return await api[method](urlWith, payload);
  } catch (err) {
    const status = err?.response?.status;
    // 404면 prefix 없는 경로로 재시도
    if (status === 404) {
      const urlWithout = `${pathNoPrefix}`;
      return await api[method](urlWithout, payload);
    }
    throw err;
  }
};

// 인증 관련 API 함수들
export const authAPIService = {
  // 회원가입
  register: async (userData) => {
    return await tryWithPrefixFallback('post', '/auth/register', userData);
  },

  // 로그인
  login: async (credentials) => {
    return await tryWithPrefixFallback('post', '/auth/login', credentials);
  },

  // 로그아웃
  logout: async () => {
    return await tryWithPrefixFallback('post', '/auth/logout');
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return await tryWithPrefixFallback('get', '/auth/me');
  },

  // OAuth 로그인 URL 생성
  getGoogleLoginUrl: () => `${API_BASE_URL}${apiPrefix}/auth/google`,
  getNaverLoginUrl: () => `${API_BASE_URL}${apiPrefix}/auth/naver`,

  // 관리자 전용 API
  // 모든 사용자 목록 조회
  getAllUsers: async () => {
    return await tryWithPrefixFallback('get', '/users/all');
  },

  // 사용자 유형 변경
  changeUserType: async (userId, userType) => {
    return await tryWithPrefixFallback('put', `/users/${userId}/type`, { userType });
  },
};

// 경량 어댑터: 기존 페이지들이 기대하는 형태로 노출
export const authApi = {
  // AuthContext와 페이지들에서 사용하는 시그니처에 맞춘 어댑터
  getCurrentUser: authAPIService.getCurrentUser,
  login: (email, password) => authAPIService.login({ email, password }),
  register: (name, email, password) => authAPIService.register({ name, email, password }),
  logout: authAPIService.logout,
  // 소셜 로그인 URL을 응답 객체 형태로 반환
  getGoogleAuthUrl: async () => ({ data: { url: authAPIService.getGoogleLoginUrl() } }),
  getNaverAuthUrl: async () => ({ data: { url: authAPIService.getNaverLoginUrl() } }),
};

// 기존 api 인스턴스를 authAPI로도 내보내기 (하위 호환성)
export { api as authAPI };
