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
import { applyGradient } from '../theme/colors';
import { 
  detectCardInfo, 
  formatCardNumber, 
  validateLuhn, 
  getValidationMessage,
  isCardTypeAccepted,
  type CardType 
} from '../utils/cardDetection';

const CHECKOUT_STEPS = ['Producto', 'Datos', 'Pago', 'Confirmación'];

// Fees configuration
const BASE_FEE = 5000; // Comisión base: $5,000 COP
const DELIVERY_FEE = 10000; // Costo de envío: $10,000 COP
const VAT_FEE_PERCENTAGE = 19; // IVA: 19%

export const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { customerId, customer, deliveryInfo, cardInfo, loading, error } = useAppSelector(
    (state) => state.checkout
  );
  const { items: cartItems, total } = useAppSelector((state) => state.cart);

  // Calculate totals
  const subtotal = total;
  const vatFee = Math.round((subtotal * VAT_FEE_PERCENTAGE) / 100);
  const totalWithFees = subtotal + BASE_FEE + DELIVERY_FEE + vatFee;


  const [localCardInfo, setLocalCardInfo] = useState({
    cardNumber: cardInfo?.cardNumber || '',
    cardHolder: cardInfo?.cardHolder || '',
    cardExpMonth: cardInfo?.cardExpMonth || '',
    cardExpYear: cardInfo?.cardExpYear || '',
    cardCvc: cardInfo?.cardCvc || '',
    installments: '1', // Número de cuotas, por defecto 1
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
  const [detectedCardType, setDetectedCardType] = useState<CardType>('unknown');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card validation with smart detection
    const cleanCardNumber = localCardInfo.cardNumber.replace(/\s/g, '');
    
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'El número de tarjeta es requerido';
    } else {
      // Validar que sea Visa o Mastercard
      if (!isCardTypeAccepted(cleanCardNumber)) {
        newErrors.cardNumber = 'Solo aceptamos tarjetas Visa y Mastercard';
      } else {
        const validationMessage = getValidationMessage(cleanCardNumber, localCardInfo.cardCvc);
        if (validationMessage) {
          newErrors.cardNumber = validationMessage;
        } else if (!validateLuhn(cleanCardNumber)) {
          newErrors.cardNumber = 'Número de tarjeta inválido (verificación Luhn falló)';
        }
      }
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

    const cardInfo = detectCardInfo(cleanCardNumber);
    const requiredCvcLength = cardInfo.cvcLength;
    
    if (!localCardInfo.cardCvc) {
      newErrors.cvv = 'El CVV es requerido';
    } else if (!requiredCvcLength.includes(localCardInfo.cardCvc.length)) {
      newErrors.cvv = 'El CVV debe tener 3 dígitos';
    }

    if (!localCardInfo.installments || parseInt(localCardInfo.installments) < 1) {
      newErrors.installments = 'Debe seleccionar el número de cuotas';
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
        baseFee: BASE_FEE,
        deliveryFee: DELIVERY_FEE,
      })
    );

    if (createTransaction.fulfilled.match(transactionResult)) {
      // Process payment
      const paymentResult = await dispatch(
        processPayment({
          transactionId: transactionResult.payload.id,
          paymentData: {
            cardNumber: localCardInfo.cardNumber.replace(/\s/g, ''), // Remove spaces
            cardExpMonth: localCardInfo.cardExpMonth,
            cardExpYear: localCardInfo.cardExpYear.slice(-2), // Convert YYYY to YY
            cardCvc: localCardInfo.cardCvc,
            cardHolder: localCardInfo.cardHolder,
            installments: parseInt(localCardInfo.installments) || 1, // Número de cuotas
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
        // Log de la respuesta para debugging
        console.log('=== RESPUESTA DE WOMPI ===');
        console.log('Transaction:', paymentResult.payload);
        if (paymentResult.payload.wompiDetails) {
          console.log('Wompi Details:', paymentResult.payload.wompiDetails);
          console.log('Status:', paymentResult.payload.wompiDetails.status);
          console.log('Status Message:', paymentResult.payload.wompiDetails.status_message);
        }
        console.log('========================');
        
        dispatch(setStep(4));
        navigate('/result');
      }
    }
  };

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 19 digits (max for any card type)
    const limited = digitsOnly.slice(0, 19);
    
    // Detect card type
    const cardInfo = detectCardInfo(limited);
    setDetectedCardType(cardInfo.type);
    
    // Format with spaces
    const formatted = formatCardNumber(limited);
    
    setLocalCardInfo((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={applyGradient('background')}>
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
      <div className="min-h-screen flex items-center justify-center" style={applyGradient('background')}>
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
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={applyGradient('background')}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <StepIndicator currentStep={3} steps={CHECKOUT_STEPS} />
        </div>

        {/* Centered Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Pago y Entrega
          </h2>
          <p className="text-gray-500 text-xs mb-3">Completa los datos</p>
          
          {/* Supported Cards */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Aceptamos:</span>
            <div className="flex gap-2">
              <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold">Visa</span>
              <span className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded font-semibold">Mastercard</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5">

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Número de Tarjeta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={23}
                        value={localCardInfo.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className={`w-full px-3 py-2 pr-24 rounded-md border ${errors.cardNumber ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {/* Card Type Indicator */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {detectedCardType !== 'unknown' && (
                          <>
                            <span className="text-lg">{detectCardInfo(localCardInfo.cardNumber).icon}</span>
                            <span 
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: detectCardInfo(localCardInfo.cardNumber).color + '20',
                                color: detectCardInfo(localCardInfo.cardNumber).color
                              }}
                            >
                              {detectCardInfo(localCardInfo.cardNumber).name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.cardNumber}</p>
                    )}
                    {/* Validation hint */}
                    {localCardInfo.cardNumber && !errors.cardNumber && (
                      <p className="text-xs mt-1 text-gray-500">
                        {detectedCardType !== 'unknown' 
                          ? `${detectCardInfo(localCardInfo.cardNumber).name} detectada`
                          : 'Ingrese un número válido'
                        }
                      </p>
                    )}
                  </div>

                  {/* Card Holder */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Titular
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
                      className={`w-full px-3 py-2 rounded-md border ${errors.cardHolder ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase`}
                      placeholder="JUAN PEREZ"
                    />
                    {errors.cardHolder && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.cardHolder}</p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mes
                      </label>
                      <select
                        value={localCardInfo.cardExpMonth}
                        onChange={(e) =>
                          setLocalCardInfo((prev) => ({
                            ...prev,
                            cardExpMonth: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 rounded-md border ${errors.expiryMonth ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {errors.expiryMonth && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.expiryMonth}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Año
                      </label>
                      <select
                        value={localCardInfo.cardExpYear}
                        onChange={(e) =>
                          setLocalCardInfo((prev) => ({
                            ...prev,
                            cardExpYear: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 rounded-md border ${errors.expiryYear ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
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
                        <p className="text-red-500 text-xs mt-0.5">{errors.expiryYear}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        CVV
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
                        className={`w-full px-3 py-2 rounded-md border ${errors.cvv ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono text-center`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  {/* Installments (Cuotas) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Número de Cuotas
                    </label>
                    <select
                      value={localCardInfo.installments}
                      onChange={(e) =>
                        setLocalCardInfo((prev) => ({
                          ...prev,
                          installments: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 rounded-md border ${errors.installments ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                    >
                      <option value="1">1 cuota (Pago único)</option>
                      <option value="2">2 cuotas</option>
                      <option value="3">3 cuotas</option>
                      <option value="6">6 cuotas</option>
                      <option value="9">9 cuotas</option>
                      <option value="12">12 cuotas</option>
                      <option value="18">18 cuotas</option>
                      <option value="24">24 cuotas</option>
                      <option value="36">36 cuotas</option>
                    </select>
                    {errors.installments && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.installments}</p>
                    )}
                  </div>

                <div className="border-t border-gray-200 my-3"></div>

                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre
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
                        className={`w-full px-3 py-2 rounded-md border ${errors.deliveryFullName ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                        placeholder="Juan Pérez"
                      />
                      {errors.deliveryFullName && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.deliveryFullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Teléfono
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
                        className={`w-full px-3 py-2 rounded-md border ${errors.deliveryPhone ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                        placeholder="+57 300 123 4567"
                      />
                      {errors.deliveryPhone && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.deliveryPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dirección
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
                      className={`w-full px-3 py-2 rounded-md border ${errors.deliveryAddress ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                      placeholder="Calle 123 #45-67"
                    />
                    {errors.deliveryAddress && (
                      <p className="text-red-500 text-xs mt-0.5">{errors.deliveryAddress}</p>
                    )}
                  </div>

                  {/* City & Department */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ciudad
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
                        className={`w-full px-3 py-2 rounded-md border ${errors.deliveryCity ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                        placeholder="Bogotá"
                      />
                      {errors.deliveryCity && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.deliveryCity}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Departamento
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
                        className={`w-full px-3 py-2 rounded-md border ${errors.deliveryDepartment ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                        placeholder="Cundinamarca"
                      />
                      {errors.deliveryDepartment && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.deliveryDepartment}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={localDeliveryInfo.notes}
                      onChange={(e) =>
                        setLocalDeliveryInfo((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      rows={2}
                      placeholder="Instrucciones especiales..."
                    />
                  </div>

                  {/* Resumen de compra */}
                <div className="p-3 bg-gray-50 rounded-md mt-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Resumen de Compra</h3>
                  
                  {/* Items */}
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="text-xs text-gray-600 mb-1 flex justify-between">
                      <span>{item.product.name} (x{item.quantity})</span>
                      <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  {/* Subtotal */}
                  <div className="text-xs text-gray-600 mb-1 flex justify-between pt-2 border-t border-gray-200">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {/* Comisión Base */}
                  <div className="text-xs text-gray-600 mb-1 flex justify-between">
                    <span>Comisión base:</span>
                    <span className="font-medium">{formatPrice(BASE_FEE)}</span>
                  </div>
                  
                  {/* Costo de Envío */}
                  <div className="text-xs text-gray-600 mb-1 flex justify-between">
                    <span>Costo de envío:</span>
                    <span className="font-medium">{formatPrice(DELIVERY_FEE)}</span>
                  </div>
                     <div className="text-xs text-gray-600 mb-1 flex justify-between">
                    <span>Iva:</span>
                    <span className="font-medium">{formatPrice(vatFee)}</span>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between text-sm font-bold">
                    <span>Total a Pagar:</span>
                    <span className="text-blue-600">
                      {formatPrice(totalWithFees)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/customer-info')}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                    disabled={loading}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Pagar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
  );
};
