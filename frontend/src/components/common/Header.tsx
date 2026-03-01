import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export const Header = () => {
  const location = useLocation();
  const cartItemsCount = useAppSelector(state => 
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-gray-200 shadow-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-xl">
                E
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                E-Shop
              </h1>
              <p className="text-xs text-gray-500 font-medium">Tu tienda favorita</p>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`text-base font-semibold transition-all duration-200 relative ${
                location.pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Productos
              {location.pathname === '/' && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
              )}
            </Link>
            
            {cartItemsCount > 0 && (
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg animate-pulse">
                  <span className="text-lg">🛒</span>
                  <span className="font-bold text-base">{cartItemsCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
