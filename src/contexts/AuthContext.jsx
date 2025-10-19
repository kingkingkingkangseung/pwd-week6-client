import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();
      const ok = response?.data?.success ?? !!(response?.data?.user || response?.data?.data?.user);
      const u = response?.data?.user || response?.data?.data?.user || null;
      setUser(u);
      setIsAuthenticated(!!ok && !!u);
    } catch (error) {
      console.log('로그인 상태 확인 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 앱 시작 시 현재 로그인 상태 확인 (1회)
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      if (response.data.success) {
        await checkAuthStatus();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '로그인에 실패했습니다.';
      return { success: false, message };
    }
  };

  const register = async (userDataOrName, maybeEmail, maybePassword) => {
    try {
      const isSplitArgs = typeof userDataOrName === 'string' && typeof maybeEmail === 'string';
      const payload = isSplitArgs 
        ? { name: userDataOrName, email: maybeEmail, password: maybePassword }
        : userDataOrName;
      const response = await authApi.register(payload.name, payload.email, payload.password);
      if (response.data.success) {
        await checkAuthStatus();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '회원가입에 실패했습니다.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log('로그아웃 요청 실패:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 관리자 권한 확인 함수
  const isAdmin = () => {
    return user && user.userType === 'admin';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    loading: isLoading, // 하위 호환
    login,
    register,
    logout,
    checkAuthStatus,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
