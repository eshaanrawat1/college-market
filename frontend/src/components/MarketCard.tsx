import { Link } from 'react-router-dom';
import type { Market } from '../types';
import { formatProbability, getStatusColor } from '../utils/helpers';

interface MarketCardProps {
  market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
  return (
    <Link to={`/market/${market.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(market.status)}`}>
            {market.status.toUpperCase()}
          </span>
          <div className="text-xs text-gray-500">
            {market.total_yes_shares + market.total_no_shares} shares traded
          </div>
        </div>

        {/* College Name */}
        <h3 className="text-xl font-semibold mb-2">{market.college_name}</h3>

        {/* Description */}
        {market.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{market.description}</p>
        )}

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          {/* YES */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">YES</div>
            <div className="text-2xl font-bold text-green-600">
              {formatProbability(market.yes_price)}
            </div>
          </div>

          {/* NO */}
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">NO</div>
            <div className="text-2xl font-bold text-red-600">
              {formatProbability(market.no_price)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketCard;