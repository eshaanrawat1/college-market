import { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';
import type { PortfolioSummary, Transaction } from '../types';
import {
  formatMoney,
  formatPercent,
  getPnLColor,
  getOutcomeBadgeColor,
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
        <div className="text-xl text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-600">Failed to load portfolio</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8">Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Balance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Cash Balance</div>
          <div className="text-3xl font-bold">{formatMoney(portfolio.balance)}</div>
        </div>

        {/* Total Invested */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Total Invested</div>
          <div className="text-3xl font-bold">{formatMoney(portfolio.total_invested)}</div>
        </div>

        {/* Current Value */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Current Value</div>
          <div className="text-3xl font-bold">{formatMoney(portfolio.total_current_value)}</div>
        </div>

        {/* Total P&L */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Total P&L</div>
          <div className={`text-3xl font-bold ${getPnLColor(portfolio.total_unrealized_pnl)}`}>
            {formatMoney(portfolio.total_unrealized_pnl)}
          </div>
          <div className={`text-sm ${getPnLColor(portfolio.total_unrealized_pnl)}`}>
            {formatPercent(portfolio.total_unrealized_pnl_percent)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('positions')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'positions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Positions ({portfolio.positions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transaction History ({transactions.length})
          </button>
        </div>
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {portfolio.positions.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
              No positions yet. Start trading to see your positions here!
            </div>
          ) : (
            portfolio.positions.map((position) => (
              <div key={position.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  {/* Left Side: Market Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">{position.market_college_name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeBadgeColor(
                          position.outcome
                        )}`}
                      >
                        {position.outcome}
                      </span>
                      <span className="text-xs text-gray-400 uppercase border border-gray-200 px-2 py-0.5 rounded">
                        {position.market_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Shares</div>
                        <div className="font-medium text-lg">{position.shares}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Avg Cost</div>
                        <div className="font-medium text-lg">{formatMoney(position.average_cost)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Current Value</div>
                        <div className="font-medium text-lg">{formatMoney(position.current_value)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Unrealized P&L</div>
                        <div className={`font-medium text-lg ${getPnLColor(position.unrealized_pnl)}`}>
                          {formatMoney(position.unrealized_pnl)} ({formatPercent(position.unrealized_pnl_percent)})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Shares</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Price</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.transaction_type === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.market_college_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeBadgeColor(tx.outcome)}`}>
                          {tx.outcome}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {tx.shares}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatMoney(tx.price_per_share)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
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