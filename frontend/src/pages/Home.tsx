import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import MarketCard from '../components/MarketCard';
import type { Market, AllowedCategory } from '../types';

type HomeProps = {
  activeCategory: string;
};

const Home = ({ activeCategory }: HomeProps) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, [activeCategory]);

  const loadMarkets = async () => {
    try {
      const categoryParam =
        activeCategory === 'all' ? undefined : (activeCategory as AllowedCategory);
      const response = await marketAPI.getAll(categoryParam);
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
        <div className="text-xl text-gray-400">Loading markets...</div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-xl text-gray-400 mb-2">No markets available</div>
          <div className="text-sm text-gray-500">Check back soon!</div>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
};

export default Home;