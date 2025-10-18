import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClipLoader } from 'react-spinners';
import styled from '@emotion/styled';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const AccessDeniedContainer = styled.div`
  text-align: center;
  padding: 4rem 1rem;
`;

const AccessDeniedTitle = styled.h1`
  color: #ff4757;
  margin-bottom: 1rem;
`;

const AccessDeniedMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <LoadingContainer>
        <ClipLoader color="#667eea" size={50} />
        <LoadingText>권한을 확인하는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 권한이 없는 경우 접근 거부
  if (!isAdmin()) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedTitle>🚫 접근 권한이 없습니다</AccessDeniedTitle>
        <AccessDeniedMessage>
          이 페이지는 관리자만 접근할 수 있습니다.
        </AccessDeniedMessage>
      </AccessDeniedContainer>
    );
  }

  // 관리자 권한이 있는 경우 자식 컴포넌트 렌더링
  return children;
};

export default AdminRoute;