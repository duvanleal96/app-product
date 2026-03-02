import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity } from '../store/cartSlice';

// Fees configuration (same as PaymentPage)
const BASE_FEE = 5000; // Comisión base: $5,000 COP
const DELIVERY_FEE = 10000; // Costo de envío: $10,000 COP

export const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cartItems, total } = useAppSelector((state) => state.cart);

  // Calculate totals
  const subtotal = total;
  const totalWithFees = subtotal + BASE_FEE + DELIVERY_FEE;

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    navigate('/customer-info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">¡Agrega productos para comenzar tu compra!</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
          Mi Carrito
        </h1>
        <p className="text-gray-600">
          {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-6">
                {/* Product Image */}
                {item.product.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-grow">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600 mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 font-bold text-xl rounded-full hover:bg-white transition-all"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-bold text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 font-bold text-xl rounded-full hover:bg-white transition-all"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toLocaleString('es-CO')} c/u
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen de orden</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Comisión base</span>
                <span className="font-semibold">${BASE_FEE.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Costo de envío</span>
                <span className="font-semibold">${DELIVERY_FEE.toLocaleString('es-CO')}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total a Pagar</span>
                  <span className="text-blue-600">${totalWithFees.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Continuar compra
            </button>

            <Link
              to="/"
              className="block text-center text-blue-600 hover:text-purple-600 font-medium mt-4 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
