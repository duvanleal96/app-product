import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProductById } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={error}
            onRetry={() => id && dispatch(fetchProductById(id))}
          />
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary w-full mt-4"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Producto no encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary mb-6"
        >
          ← Volver a productos
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={product.imageUrl || 'https://via.placeholder.com/600x400'}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div>
            <span className="badge badge-success mb-2">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-6 text-lg">{product.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Stock disponible: {product.stock} unidades
              </p>
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-secondary w-12 h-12"
                  disabled={quantity <= 1}
                >
                  -
                </button>
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
                  className="input text-center w-24"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="btn btn-secondary w-12 h-12"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn btn-primary w-full text-lg py-4"
            >
              {product.stock > 0
                ? 'Continuar con la compra'
                : 'Sin stock disponible'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
