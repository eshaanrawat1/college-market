import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import MarketCard from '../components/MarketCard';
import type { Market } from '../types';

const Home = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const response = await marketAPI.getAll();
      setMarkets(response.data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xl text-gray-600">Loading markets...</div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-2">No markets available</div>
          <div className="text-sm text-gray-500">Check back soon!</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">College Admission Markets</h1>
        <p className="text-gray-600">
          Bet on college admissions outcomes with play money
        </p>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
};

export default Home;