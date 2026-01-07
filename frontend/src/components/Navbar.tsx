import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatMoney } from '../utils/helpers';
import CategoryTabs from './CategoryTabs';

type NavbarProps = {
  activeCategory: string;
  onCategoryChange: (key: string) => void;
};

const Navbar = ({ activeCategory, onCategoryChange }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-effect border-b border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3 group">
            <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              College Market
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="glass-effect px-4 py-2 rounded-lg border border-blue-500/30">
                  <span className="text-blue-400 text-sm mr-2">Balance:</span>
                  <span className="font-bold text-white">{formatMoney(user!.balance)}</span>
                </div>
                <Link to="/portfolio" className="btn btn-outline">Portfolio</Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline h-10 px-4 flex items-center justify-center">Login</Link>
                <Link to="/register" className="btn btn-primary h-10 px-4 flex items-center justify-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Category tabs (underlined) */}
        <CategoryTabs
          activeCategory={activeCategory as any}
          onChange={(key) => onCategoryChange(key)}
        />
      </div>
    </nav>
  );
};

export default Navbar;