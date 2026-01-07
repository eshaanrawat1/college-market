import { Link } from 'react-router-dom';
import type { Market } from '../types';

interface MarketCardProps {
  market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      case 'closed':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
      case 'resolved':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  // Get color based on probability (speedometer style)
  const getProbabilityColor = (probability: number) => {
    if (probability < 33) return 'text-red-400'; // Low probability - red
    if (probability < 67) return 'text-yellow-400'; // Medium probability - yellow
    return 'text-green-400'; // High probability - green
  };

  const getProbabilityBgColor = (probability: number) => {
    if (probability < 33) return 'bg-red-500/20 border-red-500/40'; // Low probability - red
    if (probability < 67) return 'bg-yellow-500/20 border-yellow-500/40'; // Medium probability - yellow
    return 'bg-green-500/20 border-green-500/40'; // High probability - green
  };

  // Calculate rotation for speedometer (0% = -135deg, 100% = 135deg)
  const rotation = -135 + (market.yes_price / 100) * 270;

  return (
    <Link to={`/market/${market.id}`}>
      <div className="market-card group">
                {/* Header with Speedometer */}
                <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {market.college_name}
            </h3>
            {market.description && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">{market.description}</p>
            )}
          </div>
          {/* Speedometer Probability Indicator - Right Aligned */}
          <div className={`relative w-12 h-12 rounded-full border-2 ${getProbabilityBgColor(market.yes_price)} flex items-center justify-center flex-shrink-0 ml-3`}>
            {/* Speedometer arc background */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-700"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * 0.25}`}
                strokeLinecap="round"
              />
              {/* Filled arc based on probability */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={getProbabilityColor(market.yes_price)}
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - market.yes_price / 100) * 0.75}`}
                strokeLinecap="round"
                style={{
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - market.yes_price / 100) * 0.75}`,
                }}
              />
            </svg>
            {/* Percentage text */}
            <span className={`text-xs font-bold ${getProbabilityColor(market.yes_price)} relative z-10`}>
              {market.yes_price}%
            </span>
          </div>
        </div>

        {/* Yes/No Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg p-3 transition-all group/yes">
            <div className="text-xs text-green-400 mb-1 opacity-75">Yes</div>
            <div className="text-xl font-bold text-green-400">{market.yes_price}¢</div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/yes:opacity-100 transition-opacity"></div>
          </div>
          <div className="relative overflow-hidden bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg p-3 transition-all group/no">
            <div className="text-xs text-red-400 mb-1 opacity-75">No</div>
            <div className="text-xl font-bold text-red-400">{market.no_price}¢</div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover/no:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-500/20">
          <div className="text-xs text-gray-400">
            ${((market.total_yes_shares + market.total_no_shares) / 100).toFixed(0)} Volume
          </div>
          <div className={`text-xs uppercase font-semibold px-2 py-1 rounded border ${getStatusColor(market.status)}`}>
            {market.status}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketCard;