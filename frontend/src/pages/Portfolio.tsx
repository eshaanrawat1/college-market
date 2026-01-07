import { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';
import type { PortfolioSummary, Transaction } from '../types';
import {
  formatMoney,
  formatPercent,
  getPnLColor,
  formatDate,
} from '../utils/helpers';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        tradingAPI.getPortfolio(),
        tradingAPI.getTransactions(),
      ]);
      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-400">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-400">Failed to load portfolio</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8 text-white">Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Balance */}
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Cash Balance</div>
          <div className="text-3xl font-bold text-white">{formatMoney(portfolio.balance)}</div>
        </div>

        {/* Total Invested */}
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Invested</div>
          <div className="text-3xl font-bold text-white">{formatMoney(portfolio.total_invested)}</div>
        </div>

        {/* Current Value */}
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Current Value</div>
          <div className="text-3xl font-bold text-white">{formatMoney(portfolio.total_current_value)}</div>
        </div>

        {/* Total P&L */}
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total P&L</div>
          <div className={`text-3xl font-bold ${getPnLColor(portfolio.total_unrealized_pnl)}`}>
            {formatMoney(portfolio.total_unrealized_pnl)}
          </div>
          <div className={`text-sm ${getPnLColor(portfolio.total_unrealized_pnl)}`}>
            {formatPercent(portfolio.total_unrealized_pnl_percent)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('positions')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'positions'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Positions ({portfolio.positions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            History ({transactions.length})
          </button>
        </div>
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {portfolio.positions.length === 0 ? (
            <div className="card text-center text-gray-400 py-12">
              No positions yet. Start trading to see your positions here!
            </div>
          ) : (
            portfolio.positions.map((position) => (
              <div key={position.id} className="card">
                <div className="flex items-start justify-between">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{position.market_college_name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          position.outcome === 'YES'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {position.outcome}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Shares</div>
                        <div className="font-semibold text-white">{position.shares}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Cost</div>
                        <div className="font-semibold text-white">{position.average_cost}¢</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Current Price</div>
                        <div className="font-semibold text-white">
                          {position.outcome === 'YES'
                            ? position.market_yes_price
                            : position.market_no_price}
                          ¢
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Status</div>
                        <div className="font-semibold text-white capitalize">{position.market_status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - P&L */}
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">P&L</div>
                    <div className={`text-2xl font-bold ${getPnLColor(position.unrealized_pnl)}`}>
                      {formatMoney(position.unrealized_pnl)}
                    </div>
                    <div className={`text-sm ${getPnLColor(position.unrealized_pnl)}`}>
                      {formatPercent(position.unrealized_pnl_percent)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Market</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Outcome</th>
                    <th className="pb-3 font-medium text-right">Shares</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="text-sm">
                      <td className="py-3 text-gray-400">{formatDate(tx.timestamp)}</td>
                      <td className="py-3 font-medium text-white">{tx.market_college_name}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.outcome === 'YES'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {tx.outcome}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-white">{tx.shares}</td>
                      <td className="py-3 text-right text-gray-300">{tx.price_per_share}¢</td>
                      <td className="py-3 text-right font-semibold text-white">
                        {formatMoney(tx.total_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;