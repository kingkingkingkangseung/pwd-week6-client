// 기존 api.jsx에서 api 인스턴스를 가져와서 사용
import api from './api';
import { apiUrl, apiPrefix } from '../config/environment';

// 서버 URL 설정 (환경별 자동 감지)
const API_BASE_URL = apiUrl;

// 내부 헬퍼: 경로 후보 목록을 순차 시도
const requestWithCandidates = async (method, paths, payload) => {
  let lastError;
  for (const p of paths) {
    const candidates = [
      `${apiPrefix}${p}`,
      p,
    ];
    for (const url of candidates) {
      try {
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

// 인증 관련 API 함수들
export const authAPIService = {
  // 회원가입
  register: async (userData) => {
    return await requestWithCandidates('post', ['/auth/register', '/users/register', '/register'], userData);
  },

  // 로그인
  login: async (credentials) => {
    return await requestWithCandidates('post', ['/auth/login', '/users/login', '/login'], credentials);
  },

  // 로그아웃
  logout: async () => {
    return await requestWithCandidates('post', ['/auth/logout', '/users/logout', '/logout']);
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return await requestWithCandidates('get', ['/auth/me', '/users/me', '/me', '/auth/current-user']);
  },

  // OAuth 로그인 URL 생성
  getGoogleLoginUrl: () => {
    const candidates = [
      `${API_BASE_URL}${apiPrefix}/auth/google`,
      `${API_BASE_URL}/auth/google`,
      `${API_BASE_URL}/oauth/google`,
    ];
    return candidates[0];
  },
  getNaverLoginUrl: () => {
    const candidates = [
      `${API_BASE_URL}${apiPrefix}/auth/naver`,
      `${API_BASE_URL}/auth/naver`,
      `${API_BASE_URL}/oauth/naver`,
    ];
    return candidates[0];
  },

  // 관리자 전용 API
  // 모든 사용자 목록 조회
  getAllUsers: async () => {
    return await requestWithCandidates('get', ['/users/all', '/users']);
  },

  // 사용자 유형 변경
  changeUserType: async (userId, userType) => {
    return await requestWithCandidates('put', [`/users/${userId}/type`, `/users/${userId}`], { userType });
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
