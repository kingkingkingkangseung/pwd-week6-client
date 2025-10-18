import axios from 'axios';

// Axios 인스턴스 생성 (실제 백엔드 연결 시 사용 가능)
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // 실습용 기본값
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.url);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 에러:', error);
    return Promise.reject(error);
  },
);

// 모의 데이터 (메모리 보관)
let mockRestaurants = [
  {
    id: 1,
    name: '송림식당',
    category: '한식',
    location: '경기 수원시 영통구 월드컵로193번길 21 원천동',
    priceRange: '7,000-13,000원',
    rating: 4.99,
    description: '맛있는 한식 맛집입니다.',
    recommendedMenu: ['순두부', '김치찌개', '소불고기', '제육볶음'],
    likes: 0,
    image:
      'https://mblogthumb-phinf.pstatic.net/MjAyMjA2MTJfODEg/MDAxNjU0OTYzNTM3MjE1.1BfmrmOsz_B6DBHAnhQSs6qfNIDnssofR-DrzMfigIIg.JHHDheG6ifJjtfKUqLss_mLXWFE9fNJ5BmepNUVXSOog.PNG.cary63/image.png?type=w966',
  },
  {
    id: 2,
    name: '별미떡볶이',
    category: '분식',
    location: '경기 수원시 영통구 아주로 42 아카데미빌딩',
    priceRange: '7,000-10,000원',
    rating: 4.98,
    description: '바삭한 튀김과 함께하는 행복한 한입',
    recommendedMenu: ['떡볶이', '튀김', '순대', '어묵'],
    likes: 0,
    image:
      'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA4MTJfMjcg%2FMDAxNzU0OTQ5ODk1Mjg0.GR6i3mNpJJXyqQrozGEJ65InCDBGlEmxc0aCeVHncJgg.sduDPX67J8hhoGxq4vLohpS4dXk1w-706dQLPfVs1iwg.JPEG%2Foutput%25A3%25DF1564208956.jpg',
  },
  {
    id: 3,
    name: 'Sogo',
    category: '일식',
    location: '경기 수원시 영통구 월드컵로193번길 7',
    priceRange: '10,000-16,000원',
    rating: 4.89,
    description: '일식 맛집, 구 허수아비,',
    recommendedMenu: ['냉모밀', '김치돈까스나베', '코돈부르'],
    likes: 0,
    image:
      'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190707_63%2F1562462598960nPDMy_JPEG%2FW7iKQEhTMzCF3flC1t0pzgzF.jpeg.jpg',
  },
];

export const restaurantAPI = {
  // 목록
  getRestaurants: async () => {
    return { data: mockRestaurants };
  },

  // 상세
  getRestaurantById: async (id) => {
    const restaurant = mockRestaurants.find((r) => r.id === Number(id));
    return { data: restaurant };
  },

  // 인기
  getPopularRestaurants: async () => {
    const sorted = [...mockRestaurants].sort((a, b) => b.rating - a.rating);
    return { data: sorted.slice(0, 5) };
  },

  // 생성
  createRestaurant: async (payload) => {
    const nextId = mockRestaurants.length
      ? Math.max(...mockRestaurants.map((r) => r.id)) + 1
      : 1;
    const newItem = {
      id: nextId,
      rating: 0,
      likes: 0,
      ...payload,
    };
    mockRestaurants = [newItem, ...mockRestaurants];
    return { data: newItem };
  },

  // 수정
  updateRestaurant: async (id, payload) => {
    const idx = mockRestaurants.findIndex((r) => r.id === Number(id));
    if (idx === -1) return { data: null };
    mockRestaurants[idx] = { ...mockRestaurants[idx], ...payload };
    return { data: mockRestaurants[idx] };
  },

  // 삭제
  deleteRestaurant: async (id) => {
    mockRestaurants = mockRestaurants.filter((r) => r.id !== Number(id));
    return { data: { success: true } };
  },
};

// 제보 API (모의)
let mockSubmissions = [
  {
    id: 101,
    restaurantName: '새집 한식당',
    category: '한식',
    location: '서울 강남구 어딘가 1',
    priceRange: '9,000-15,000원',
    recommendedMenu: ['제육볶음', '비빔밥'],
    review: '가성비 좋아요',
    submitterName: '홍길동',
    submitterEmail: 'hong@example.com',
    status: 'pending',
  },
  {
    id: 102,
    restaurantName: '분식나라',
    category: '분식',
    location: '수원시 영통구 어딘가 2',
    priceRange: '6,000-9,000원',
    recommendedMenu: ['떡볶이', '김밥'],
    review: '매콤달콤',
    submitterName: '김영희',
    submitterEmail: 'young@example.com',
    status: 'approved',
  },
];

export const submissionAPI = {
  // 목록
  listSubmissions: async (status) => {
    const items = status && status !== 'all'
      ? mockSubmissions.filter((s) => s.status === status)
      : mockSubmissions;
    return { data: items };
  },

  // 수정
  updateSubmission: async (id, payload) => {
    const idx = mockSubmissions.findIndex((s) => s.id === Number(id));
    if (idx === -1) return { data: null };
    mockSubmissions[idx] = { ...mockSubmissions[idx], ...payload };
    return { data: mockSubmissions[idx] };
  },

  // 삭제
  deleteSubmission: async (id) => {
    mockSubmissions = mockSubmissions.filter((s) => s.id !== Number(id));
    return { data: { success: true } };
  },
};

export default api;
