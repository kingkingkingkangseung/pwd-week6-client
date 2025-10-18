// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Axios 인스턴스
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pwd-week6-server-36mc.onrender.com/api',
    withCredentials: true, // ✅ 세션 쿠키 포함
  });

  // ✅ 로그인 상태 확인
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/me');
      if (res.data?.authenticated) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false); // ✅ 이거 없으면 Dashboard 무한 로딩
    }
  };

  // ✅ 로그아웃
  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // ✅ 관리자 여부 판단
  const isAdmin = () => user?.userType === 'admin';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, checkAuthStatus, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ useAuth 훅
export const useAuth = () => useContext(AuthContext);
