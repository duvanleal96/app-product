import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProductById } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { applyGradient } from '../theme/colors';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading, error } = useAppSelector(
    (state) => state.products
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product && quantity > 0 && quantity <= product.stock) {
      dispatch(addToCart({ product, quantity }));
      navigate('/customer-info');
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={applyGradient('background')}>
        <div className="max-w-md w-full">
          <ErrorMessage
            message={error}
            onRetry={() => id && dispatch(fetchProductById(id))}
          />
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full mt-6"
          >
            <span className="inline-flex items-center gap-2">
              <span>⬅️</span>
              Volver a productos
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={applyGradient('background')}>
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o fue eliminado</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            <span className="inline-flex items-center gap-2">
              <span>⬅️</span>
              Volver a productos
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={applyGradient('background')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="group mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-blue-600 font-bold transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
        >
          <span className="text-2xl transform group-hover:-translate-x-2 transition-transform">⬅️</span>
          <span>Volver a productos</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/600x400'}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
              {product.stock > 0 && (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-black text-lg shadow-2xl animate-bounce">
                    <span className="text-2xl">✅</span>
                    <span>DISPONIBLE</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6 text-center md:text-left">
              <span className="inline-block px-6 py-3 text-base font-black text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl uppercase tracking-wider">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight text-center md:text-left bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {product.name}
            </h1>
            
            <p className="text-gray-700 mb-8 text-xl leading-relaxed text-center md:text-left font-medium">{product.description}</p>

            <div className="mb-8 p-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl border-4 border-white shadow-2xl transform hover:scale-105 transition-transform">
              <p className="text-sm text-white/80 mb-2 font-bold uppercase tracking-wider text-center">Precio</p>
              <span className="block text-center text-6xl font-black text-white drop-shadow-2xl">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-200">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">📦</span>
                <p className="text-xl font-black text-gray-800">
                  {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                </p>
              </div>
            </div>

            {/* Quantity selector */}
            <div className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-200">
              <label className="block text-2xl font-black text-gray-900 mb-6 text-center uppercase tracking-wider">
                Cantidad
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 text-white border-4 border-white rounded-2xl hover:from-red-600 hover:to-pink-600 shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black text-3xl transform hover:scale-110 active:scale-95"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          Math.max(1, parseInt(e.target.value) || 1),
                          product.stock
                        )
                      )
                    }
                    className="w-32 h-16 text-center text-4xl font-black border-4 border-purple-400 rounded-2xl focus:ring-8 focus:ring-purple-200 focus:border-purple-600 transition-all bg-white shadow-xl"
                  />
                </div>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 text-white border-4 border-white rounded-2xl hover:from-green-600 hover:to-emerald-600 shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black text-3xl transform hover:scale-110 active:scale-95"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mb-8 p-8 bg-white rounded-3xl shadow-2xl border-4 border-purple-300">
              <div className="text-center">
                <span className="block text-xl font-bold text-gray-600 mb-3 uppercase tracking-wider">Total a pagar</span>
                <span className="block text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn btn-primary w-full text-2xl py-8"
            >
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🛒</span>
                  <span>CONTINUAR CON LA COMPRA</span>
                </span>
              ) : (
                'SIN STOCK DISPONIBLE'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
