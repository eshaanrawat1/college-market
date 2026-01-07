// User types
export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Category type
export type AllowedCategory = 'uc' | 'ivy' | 'csu' | 'international' | 'other';

// Market types
export interface Market {
  id: number;
  college_name: string;
  description: string | null;
  yes_price: number;
  no_price: number;
  status: 'open' | 'closed' | 'resolved';
  total_yes_shares: number;
  total_no_shares: number;
  resolved_outcome: string | null;
  resolution_date: string | null;
  created_at: string;
  category: AllowedCategory;
}

export interface MarketCreate {
  college_name: string;
  description?: string;
  yes_price: number;
  no_price: number;
  category: AllowedCategory;
}

// Position types
export interface Position {
  id: number;
  market_id: number;
  outcome: 'YES' | 'NO';
  shares: number;
  average_cost: number;
  current_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  market_college_name: string;
  market_yes_price: number;
  market_no_price: number;
  market_status: string;
}

// Transaction types
export interface Transaction {
  id: number;
  market_id: number;
  transaction_type: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  shares: number;
  price_per_share: number;
  total_cost: number;
  timestamp: string;
  market_college_name: string;
}

// Trading types
export interface TradeRequest {
  market_id: number;
  outcome: 'YES' | 'NO';
  shares: number;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  transaction_id: number;
  shares: number;
  price_per_share: number;
  total_cost: number;
  new_balance: number;
  position: Position;
}

// Portfolio types
export interface PortfolioSummary {
  balance: number;
  total_invested: number;
  total_current_value: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percent: number;
  positions: Position[];
}