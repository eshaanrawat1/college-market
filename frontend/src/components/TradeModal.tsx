import { useState } from 'react';
import { tradingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Market } from '../types';
import { formatMoney } from '../utils/helpers';

interface TradeModalProps {
  market: Market;
  onClose: () => void;
  onSuccess: () => void;
}

const TradeModal = ({ market, onClose, onSuccess }: TradeModalProps) => {
  const { user } = useAuth();
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
  const [shares, setShares] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const currentPrice = outcome === 'YES' ? market.yes_price : market.no_price;
  const sharesNum = parseInt(shares) || 0;
  const totalCost = sharesNum * currentPrice;

  const handleTrade = async () => {
    if (sharesNum <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (totalCost > user!.balance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await tradingAPI.executeTrade({
        market_id: market.id,
        outcome,
        shares: sharesNum,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl border border-blue-500/30 p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Place Order
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Market Name */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-1">Market</div>
          <div className="font-semibold text-white text-lg">{market.college_name}</div>
        </div>

        {/* Outcome Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mb-3 block">Outcome</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOutcome('YES')}
              className={`relative overflow-hidden p-5 rounded-xl border-2 font-medium transition-all ${
                outcome === 'YES'
                  ? 'border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                  : 'border-blue-500/30 bg-blue-500/5 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
              }`}
            >
              <div className="text-xs mb-2 opacity-75">YES</div>
              <div className="text-3xl font-bold">{market.yes_price}¢</div>
              {outcome === 'YES' && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
              )}
            </button>

            <button
              onClick={() => setOutcome('NO')}
              className={`relative overflow-hidden p-5 rounded-xl border-2 font-medium transition-all ${
                outcome === 'NO'
                  ? 'border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                  : 'border-blue-500/30 bg-blue-500/5 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
              }`}
            >
              <div className="text-xs mb-2 opacity-75">NO</div>
              <div className="text-3xl font-bold">{market.no_price}¢</div>
              {outcome === 'NO' && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
              )}
            </button>
          </div>
        </div>

        {/* Shares Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Shares</label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="input"
            min="1"
            placeholder="Enter number of shares"
          />
        </div>

        {/* Summary */}
        <div className="glass-effect rounded-xl p-5 mb-6 space-y-3 border border-blue-500/20">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price per share</span>
            <span className="font-medium text-white">{currentPrice}¢</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Shares</span>
            <span className="font-medium text-white">{sharesNum}</span>
          </div>
          <div className="border-t border-blue-500/20 pt-3 flex justify-between">
            <span className="font-semibold text-white">Total Cost</span>
            <span className="font-bold text-xl text-white">{formatMoney(totalCost)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Balance after: {formatMoney(user!.balance - totalCost)}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="btn btn-outline flex-1" 
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleTrade}
            className="btn btn-primary flex-1"
            disabled={loading || sharesNum <= 0 || totalCost > user!.balance}
          >
            {loading ? 'Processing...' : 'Buy Shares'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;