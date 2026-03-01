import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { ProductCard } from '../components/products/ProductCard';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { applyGradient } from '../theme/colors';
import type { Product } from '../types';

export const ProductListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products, loading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen" style={applyGradient('background')}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={applyGradient('primary')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in text-white">
              Bienvenido a E-Shop
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Descubre los mejores productos de tecnología y gaming
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-base font-medium text-white/95">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <span>Miles de clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span>Calidad garantizada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span>Entrega rápida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Nuestros Productos
              </h2>
              <p className="text-gray-600">
                {products.length} productos disponibles
              </p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchProducts())}
          />
        )}

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg font-medium">
              No hay productos disponibles en este momento
            </p>
            <p className="text-gray-400 mt-2">
              Vuelve más tarde para ver nuestras novedades
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleSelectProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
