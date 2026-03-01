import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/cartSlice';
import { StepIndicator } from '../components/common/StepIndicator';
import { Loading } from '../components/common/Loading';
import { applyGradient } from '../theme/colors';

const CHECKOUT_STEPS = ['Producto', 'Datos', 'Pago', 'Confirmación'];

export const ResultPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { transaction, loading } = useAppSelector((state) => state.checkout);
  const [showWompiDetails, setShowWompiDetails] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center" style={applyGradient('background')}>
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
    <div className="min-h-screen py-8" style={applyGradient('background')}>
      <div className="max-w-3xl mx-auto px-4">
        <StepIndicator currentStep={4} steps={CHECKOUT_STEPS} />

        <div className="card text-center">
          {/* Icon */}
          <div className="mb-6">
            {isSuccess ? (
              <div className="text-6xl">✅</div>
            ) : (
              <div className="text-6xl">❌</div>
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

          {/* Wompi Details (Debugging) */}
          {transaction.wompiDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <button
                onClick={() => setShowWompiDetails(!showWompiDetails)}
                className="w-full flex justify-between items-center text-left mb-4"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  🔍 Detalles Técnicos de Wompi
                </h2>
                <span className="text-2xl">{showWompiDetails ? '▼' : '▶'}</span>
              </button>
              
              {showWompiDetails && (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="mb-2"><strong>Estado:</strong> {transaction.wompiDetails.status}</div>
                    <div className="mb-2"><strong>ID de Transacción:</strong> {transaction.wompiDetails.id}</div>
                    <div className="mb-2"><strong>Referencia:</strong> {transaction.wompiDetails.reference}</div>
                    <div className="mb-2"><strong>Monto:</strong> ${(transaction.wompiDetails.amount_in_cents / 100).toLocaleString('es-CO')}</div>
                    <div className="mb-2"><strong>Moneda:</strong> {transaction.wompiDetails.currency}</div>
                    <div className="mb-2"><strong>Método de pago:</strong> {transaction.wompiDetails.payment_method?.type}</div>
                    {transaction.wompiDetails.status_message && (
                      <div className="mb-2"><strong>Mensaje:</strong> {transaction.wompiDetails.status_message}</div>
                    )}
                    {transaction.wompiDetails.payment_method_type && (
                      <div className="mb-2"><strong>Tipo de tarjeta:</strong> {transaction.wompiDetails.payment_method_type}</div>
                    )}
                  </div>
                  
                  <details className="bg-white rounded-lg p-4 border border-gray-200">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      Ver respuesta completa (JSON)
                    </summary>
                    <pre className="mt-3 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                      {JSON.stringify(transaction.wompiDetails, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}

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
