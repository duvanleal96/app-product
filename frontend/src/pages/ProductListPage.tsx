import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { ProductCard } from '../components/products/ProductCard';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tienda de Productos
          </h1>
          <p className="text-gray-600">
            Selecciona un producto para comenzar tu compra
          </p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchProducts())}
          />
        )}

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay productos disponibles en este momento
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
