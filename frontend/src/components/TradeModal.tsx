import { useState } from 'react';
import { tradingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Market } from '../types';
import { formatMoney, formatProbability } from '../utils/helpers';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Market Name */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Market</div>
          <div className="font-semibold">{market.college_name}</div>
        </div>

        {/* Outcome Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Outcome</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOutcome('YES')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                outcome === 'YES'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs mb-1">YES</div>
              <div className="text-lg font-bold">{formatProbability(market.yes_price)}</div>
            </button>

            <button
              onClick={() => setOutcome('NO')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                outcome === 'NO'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs mb-1">NO</div>
              <div className="text-lg font-bold">{formatProbability(market.no_price)}</div>
            </button>
          </div>
        </div>

        {/* Shares Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Shares</label>
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
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per share</span>
            <span className="font-medium">{currentPrice}¢</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shares</span>
            <span className="font-medium">{sharesNum}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold">Total Cost</span>
            <span className="font-bold text-lg">{formatMoney(totalCost)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Balance after: {formatMoney(user!.balance - totalCost)}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-outline flex-1" disabled={loading}>
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