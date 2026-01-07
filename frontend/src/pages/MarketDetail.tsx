import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TradeModal from '../components/TradeModal';
import type { Market } from '../types';
import { formatDate } from '../utils/helpers';

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTradeModal, setShowTradeModal] = useState(false);

  useEffect(() => {
    loadMarket();
  }, [id]);

  const loadMarket = async () => {
    try {
      const response = await marketAPI.getById(parseInt(id!));
      setMarket(response.data);
    } catch (error) {
      console.error('Failed to load market:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowTradeModal(true);
  };

  const handleTradeSuccess = () => {
    setShowTradeModal(false);
    loadMarket();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'closed': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      case 'resolved': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-400">Loading market...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-400">Market not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        ← Back to Markets
      </button>

      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">{market.college_name}</h1>
            {market.description && (
              <p className="text-gray-400">{market.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium border ${getStatusColor(market.status)}`}>
            {market.status.toUpperCase()}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              ${((market.total_yes_shares + market.total_no_shares) / 100).toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm text-gray-400 mb-1">Created</div>
            <div className="text-2xl font-bold text-white">{formatDate(market.created_at)}</div>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* YES */}
          <div className="bg-green-500/10 rounded-xl p-6 border-2 border-green-500/30">
            <div className="text-sm text-gray-400 mb-2">YES</div>
            <div className="text-5xl font-bold text-green-400 mb-2">
              {market.yes_price}%
            </div>
            <div className="text-sm text-gray-500">
              {market.total_yes_shares} shares
            </div>
          </div>

          {/* NO */}
          <div className="bg-red-500/10 rounded-xl p-6 border-2 border-red-500/30">
            <div className="text-sm text-gray-400 mb-2">NO</div>
            <div className="text-5xl font-bold text-red-400 mb-2">
              {market.no_price}%
            </div>
            <div className="text-sm text-gray-500">
              {market.total_no_shares} shares
            </div>
          </div>
        </div>

        {/* Resolution Info */}
        {market.status === 'resolved' && market.resolved_outcome && (
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4 mb-6">
            <div className="text-sm font-medium text-purple-400 mb-1">Market Resolved</div>
            <div className="text-lg font-bold text-purple-300">
              Outcome: {market.resolved_outcome}
            </div>
            {market.resolution_date && (
              <div className="text-sm text-purple-400 mt-1">
                Resolved on {formatDate(market.resolution_date)}
              </div>
            )}
          </div>
        )}

        {/* Trade Button */}
        {market.status === 'open' && (
          <button 
            onClick={handleTradeClick} 
            className="btn btn-primary w-full text-lg py-4"
          >
            Trade on this Market
          </button>
        )}

        {market.status !== 'open' && (
          <div className="text-center text-gray-500 py-4">
            This market is {market.status} and no longer accepting trades
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal
          market={market}
          onClose={() => setShowTradeModal(false)}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
};

export default MarketDetail;