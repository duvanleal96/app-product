import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createCustomer, setStep } from '../store/checkoutSlice';
import { StepIndicator } from '../components/common/StepIndicator';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { applyGradient } from '../theme/colors';
import type { CreateCustomerDto } from '../types';

const CHECKOUT_STEPS = ['Producto', 'Datos', 'Pago', 'Confirmación'];

export const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.checkout);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [formData, setFormData] = useState<CreateCustomerDto>({
    fullName: '',
    email: '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
    address: '',
    city: '',
    country: 'Colombia',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCustomerDto, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCustomerDto, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(createCustomer(formData));
    if (createCustomer.fulfilled.match(result)) {
      dispatch(setStep(3));
      navigate('/payment');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof CreateCustomerDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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
          <StepIndicator currentStep={2} steps={CHECKOUT_STEPS} />
        </div>

        {/* Centered Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Información del Cliente
          </h2>
          <p className="text-gray-500 text-xs">Completa tus datos</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5">

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${errors.fullName ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Juan Pérez"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="juan@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${errors.phone ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="+57 300 123 4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>
                )}
              </div>

              <div className="border-t border-gray-200 my-3"></div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="documentType" className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo Doc.
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="CC">Cédula</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="documentNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${errors.documentNumber ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                    placeholder="1234567890"
                  />
                  {errors.documentNumber && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.documentNumber}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 my-3"></div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${errors.address ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Calle 123 #45-67"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.address}</p>
                )}
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${errors.city ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
                    placeholder="Bogotá"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Colombia"
                  />
                </div>
              </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                {loading ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
