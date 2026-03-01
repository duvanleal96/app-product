import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/cartSlice';
import { StepIndicator } from '../components/common/StepIndicator';
import { Loading } from '../components/common/Loading';

const CHECKOUT_STEPS = ['Producto', 'Datos', 'Pago', 'Confirmación'];

export const ResultPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { transaction, loading } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    // Clear cart on successful transaction
    if (transaction && transaction.status === 'APPROVED') {
      dispatch(clearCart());
    }
  }, [dispatch, transaction]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success text-lg px-4 py-2">✓ Aprobada</span>;
      case 'PENDING':
        return <span className="badge badge-warning text-lg px-4 py-2">⏳ Pendiente</span>;
      case 'DECLINED':
        return <span className="badge badge-danger text-lg px-4 py-2">✗ Rechazada</span>;
      case 'ERROR':
        return <span className="badge badge-danger text-lg px-4 py-2">⚠ Error</span>;
      default:
        return <span className="badge text-lg px-4 py-2">{status}</span>;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No se encontró información de la transacción</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = transaction.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <StepIndicator currentStep={4} steps={CHECKOUT_STEPS} />

        <div className="card text-center">
          {/* Icon */}
          <div className="mb-6">
            {isSuccess ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isSuccess
              ? '¡Pago Exitoso!'
              : transaction.status === 'PENDING'
              ? 'Pago Pendiente'
              : 'Pago No Exitoso'}
          </h1>

          {/* Status Badge */}
          <div className="mb-6">{getStatusBadge(transaction.status)}</div>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            {isSuccess
              ? 'Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación con los detalles de tu pedido.'
              : transaction.status === 'PENDING'
              ? 'Tu pago está siendo procesado. Te notificaremos una vez se confirme.'
              : 'No se pudo procesar tu pago. Por favor intenta nuevamente o contacta con soporte.'}
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Detalles de la Transacción
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Transacción:</span>
                <span className="font-medium font-mono text-sm">{transaction.id}</span>
              </div>
              {transaction.paymentReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Referencia de Pago:</span>
                  <span className="font-medium font-mono text-sm">
                    {transaction.paymentReference}
                  </span>
                </div>
              )}
              {transaction.wompiTransactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Wompi:</span>
                  <span className="font-medium font-mono text-sm">
                    {transaction.wompiTransactionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(transaction.subtotal)}</span>
              </div>
              {transaction.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">
                    {formatPrice(transaction.deliveryFee)}
                  </span>
                </div>
              )}
              {transaction.baseFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-medium">{formatPrice(transaction.baseFee)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-blue-600">
                  {formatPrice(transaction.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary px-8"
            >
              Volver a la tienda
            </button>
            {!isSuccess && (
              <button
                onClick={() => navigate('/payment')}
                className="btn btn-secondary px-8"
              >
                Intentar de nuevo
              </button>
            )}
          </div>

          {/* Additional Info */}
          {isSuccess && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Próximos pasos:</strong> Recibirás un correo con el número
                de seguimiento de tu pedido. El tiempo estimado de entrega es de 3-5 días
                hábiles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
