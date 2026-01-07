import axios, { AxiosInstance } from 'axios';
import type {
  User,
  UserCreate,
  UserLogin,
  TokenResponse,
  Market,
  MarketCreate,
  TradeRequest,
  TradeResponse,
  PortfolioSummary,
  Transaction,
  AllowedCategory,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData: UserCreate) => api.post<User>('/auth/register', userData),
  login: (credentials: UserLogin) => api.post<TokenResponse>('/auth/login', credentials),
  getMe: () => api.get<User>('/auth/me'),
};

export const marketAPI = {
  getAll: (category?: AllowedCategory) =>
    api.get<Market[]>('/markets', { params: category ? { category } : {} }),
  getById: (id: number) => api.get<Market>(`/markets/${id}`),
  create: (marketData: MarketCreate) => api.post<Market>('/markets', marketData),
  resolve: (id: number, outcome: 'YES' | 'NO') =>
    api.post<Market>(`/markets/${id}/resolve`, { outcome }),
};

export const tradingAPI = {
  executeTrade: (tradeData: TradeRequest) => api.post<TradeResponse>('/trade', tradeData),
  getPortfolio: () => api.get<PortfolioSummary>('/portfolio'),
  getTransactions: () => api.get<Transaction[]>('/transactions'),
};

export default api;