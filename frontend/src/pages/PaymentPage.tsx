import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createTransaction,
  processPayment,
  setStep,
  setDeliveryInfo,
  setCardInfo,
} from '../store/checkoutSlice';
import { StepIndicator } from '../components/common/StepIndicator';
import { ErrorMessage } from '../components/common/ErrorMessage';

const CHECKOUT_STEPS = ['Producto', 'Datos', 'Pago', 'Confirmación'];

export const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { customerId, customer, deliveryInfo, cardInfo, loading, error } = useAppSelector(
    (state) => state.checkout
  );
  const { items: cartItems, total } = useAppSelector((state) => state.cart);

  const [localCardInfo, setLocalCardInfo] = useState({
    cardNumber: cardInfo?.cardNumber || '',
    cardHolder: cardInfo?.cardHolder || '',
    cardExpMonth: cardInfo?.cardExpMonth || '',
    cardExpYear: cardInfo?.cardExpYear || '',
    cardCvc: cardInfo?.cardCvc || '',
  });

  const [localDeliveryInfo, setLocalDeliveryInfo] = useState({
    address: deliveryInfo?.address || customer?.address || '',
    city: deliveryInfo?.city || customer?.city || '',
    department: deliveryInfo?.department || '',
    fullName: deliveryInfo?.fullName || customer?.fullName || '',
    phone: deliveryInfo?.phone || customer?.phone || '',
    notes: deliveryInfo?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card validation
    if (!localCardInfo.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'El número de tarjeta es requerido';
    } else if (localCardInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
    }

    if (!localCardInfo.cardHolder.trim()) {
      newErrors.cardHolder = 'El titular de la tarjeta es requerido';
    }

    if (!localCardInfo.cardExpMonth) {
      newErrors.expiryMonth = 'El mes de expiración es requerido';
    }

    if (!localCardInfo.cardExpYear) {
      newErrors.expiryYear = 'El año de expiración es requerido';
    }

    if (!localCardInfo.cardCvc) {
      newErrors.cvv = 'El CVV es requerido';
    } else if (localCardInfo.cardCvc.length < 3) {
      newErrors.cvv = 'El CVV debe tener al menos 3 dígitos';
    }

    // Delivery validation
    if (!localDeliveryInfo.fullName.trim()) {
      newErrors.deliveryFullName = 'El nombre completo es requerido';
    }

    if (!localDeliveryInfo.phone.trim()) {
      newErrors.deliveryPhone = 'El teléfono es requerido';
    }

    if (!localDeliveryInfo.address.trim()) {
      newErrors.deliveryAddress = 'La dirección de entrega es requerida';
    }

    if (!localDeliveryInfo.city.trim()) {
      newErrors.deliveryCity = 'La ciudad de entrega es requerida';
    }

    if (!localDeliveryInfo.department.trim()) {
      newErrors.deliveryDepartment = 'El departamento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !customerId || cartItems.length === 0) {
      return;
    }

    // Update store with form data
    dispatch(setCardInfo(localCardInfo));
    dispatch(setDeliveryInfo({
      fullName: localDeliveryInfo.fullName,
      phone: localDeliveryInfo.phone,
      address: localDeliveryInfo.address,
      city: localDeliveryInfo.city,
      department: localDeliveryInfo.department,
      notes: localDeliveryInfo.notes,
    }));

    // Create transaction
    const transactionResult = await dispatch(
      createTransaction({
        customerId,
        productId: cartItems[0].product.id,
        quantity: cartItems[0].quantity,
      })
    );

    if (createTransaction.fulfilled.match(transactionResult)) {
      // Process payment
      const paymentResult = await dispatch(
        processPayment({
          transactionId: transactionResult.payload.id,
          paymentData: {
            ...localCardInfo,
            deliveryInfo: {
              fullName: localDeliveryInfo.fullName,
              phone: localDeliveryInfo.phone,
              address: localDeliveryInfo.address,
              city: localDeliveryInfo.city,
              department: localDeliveryInfo.department,
              notes: localDeliveryInfo.notes,
            },
          },
        })
      );

      if (processPayment.fulfilled.match(paymentResult)) {
        dispatch(setStep(4));
        navigate('/result');
      }
    }
  };

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits and format with spaces
    const digitsOnly = value.replace(/\D/g, '');
    const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || digitsOnly;
    setLocalCardInfo((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Por favor completa tus datos personales primero
          </p>
          <button onClick={() => navigate('/customer-info')} className="btn btn-primary">
            Ir a datos personales
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes productos en tu carrito</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <StepIndicator currentStep={3} steps={CHECKOUT_STEPS} />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Pago
              </h2>

              {error && <ErrorMessage message={error} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Tarjeta *
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={localCardInfo.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className={`input ${errors.cardNumber ? 'input-error' : ''}`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titular de la Tarjeta *
                  </label>
                  <input
                    type="text"
                    value={localCardInfo.cardHolder}
                    onChange={(e) =>
                      setLocalCardInfo((prev) => ({
                        ...prev,
                        cardHolder: e.target.value.toUpperCase(),
                      }))
                    }
                    className={`input ${errors.cardHolder ? 'input-error' : ''}`}
                    placeholder="JUAN PEREZ"
                  />
                  {errors.cardHolder && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mes *
                    </label>
                    <select
                      value={localCardInfo.cardExpMonth}
                      onChange={(e) =>
                        setLocalCardInfo((prev) => ({
                          ...prev,
                          cardExpMonth: e.target.value,
                        }))
                      }
                      className={`input ${errors.expiryMonth ? 'input-error' : ''}`}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    {errors.expiryMonth && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año *
                    </label>
                    <select
                      value={localCardInfo.cardExpYear}
                      onChange={(e) =>
                        setLocalCardInfo((prev) => ({
                          ...prev,
                          cardExpYear: e.target.value,
                        }))
                      }
                      className={`input ${errors.expiryYear ? 'input-error' : ''}`}
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      )}
                    </select>
                    {errors.expiryYear && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryYear}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={localCardInfo.cardCvc}
                      onChange={(e) =>
                        setLocalCardInfo((prev) => ({
                          ...prev,
                          cardCvc: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                      className={`input ${errors.cvv ? 'input-error' : ''}`}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <hr className="my-6" />

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Información de Entrega
                </h3>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={localDeliveryInfo.fullName}
                      onChange={(e) =>
                        setLocalDeliveryInfo((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className={`input ${errors.deliveryFullName ? 'input-error' : ''}`}
                      placeholder="Juan Pérez"
                    />
                    {errors.deliveryFullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryFullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={localDeliveryInfo.phone}
                      onChange={(e) =>
                        setLocalDeliveryInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className={`input ${errors.deliveryPhone ? 'input-error' : ''}`}
                      placeholder="+57 300 123 4567"
                    />
                    {errors.deliveryPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryPhone}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Entrega *
                  </label>
                  <input
                    type="text"
                    value={localDeliveryInfo.address}
                    onChange={(e) =>
                      setLocalDeliveryInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className={`input ${errors.deliveryAddress ? 'input-error' : ''}`}
                    placeholder="Calle 123 #45-67"
                  />
                  {errors.deliveryAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
                  )}
                </div>

                {/* City & Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={localDeliveryInfo.city}
                      onChange={(e) =>
                        setLocalDeliveryInfo((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className={`input ${errors.deliveryCity ? 'input-error' : ''}`}
                      placeholder="Bogotá"
                    />
                    {errors.deliveryCity && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryCity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={localDeliveryInfo.department}
                      onChange={(e) =>
                        setLocalDeliveryInfo((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className={`input ${errors.deliveryDepartment ? 'input-error' : ''}`}
                      placeholder="Cundinamarca"
                    />
                    {errors.deliveryDepartment && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.deliveryDepartment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={localDeliveryInfo.notes}
                    onChange={(e) =>
                      setLocalDeliveryInfo((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="input"
                    rows={3}
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/customer-info')}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Procesar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Resumen de Compra
              </h3>
              {cartItems.map((item) => (
                <div key={item.product.id} className="mb-4 pb-4 border-b">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">{formatPrice(10000)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(total + 10000)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
