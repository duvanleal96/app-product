export enum ErrorCode {
  // Customer errors (1xxx)
  CUSTOMER_NOT_FOUND = 'ERR-1001',
  CUSTOMER_ALREADY_EXISTS = 'ERR-1002',
  CUSTOMER_INVALID_DATA = 'ERR-1003',
  CUSTOMER_UPDATE_FAILED = 'ERR-1004',
  CUSTOMER_DELETE_FAILED = 'ERR-1005',

  // Product errors (2xxx)
  PRODUCT_NOT_FOUND = 'ERR-2001',
  PRODUCT_OUT_OF_STOCK = 'ERR-2002',
  PRODUCT_INVALID_DATA = 'ERR-2003',
  PRODUCT_UPDATE_FAILED = 'ERR-2004',
  PRODUCT_DELETE_FAILED = 'ERR-2005',

  // Transaction errors (3xxx)
  TRANSACTION_NOT_FOUND = 'ERR-3001',
  TRANSACTION_INVALID_DATA = 'ERR-3002',
  TRANSACTION_PAYMENT_FAILED = 'ERR-3003',
  TRANSACTION_ALREADY_PROCESSED = 'ERR-3004',
  TRANSACTION_INVALID_STATUS = 'ERR-3005',
  TRANSACTION_INSUFFICIENT_FUNDS = 'ERR-3006',
  TRANSACTION_UPDATE_FAILED = 'ERR-3007',

  // Delivery errors (4xxx)
  DELIVERY_NOT_FOUND = 'ERR-4001',
  DELIVERY_INVALID_DATA = 'ERR-4002',
  DELIVERY_UPDATE_FAILED = 'ERR-4003',
  DELIVERY_ALREADY_EXISTS = 'ERR-4004',

  // Payment Gateway errors (5xxx)
  PAYMENT_GATEWAY_ERROR = 'ERR-5001',
  PAYMENT_GATEWAY_TIMEOUT = 'ERR-5002',
  PAYMENT_GATEWAY_INVALID_CREDENTIALS = 'ERR-5003',
  PAYMENT_GATEWAY_CARD_DECLINED = 'ERR-5004',
  PAYMENT_GATEWAY_INSUFFICIENT_FUNDS = 'ERR-5005',

  // Database errors (6xxx)
  DATABASE_CONNECTION_ERROR = 'ERR-6001',
  DATABASE_QUERY_ERROR = 'ERR-6002',
  DATABASE_CONSTRAINT_ERROR = 'ERR-6003',

  // General errors (9xxx)
  INTERNAL_SERVER_ERROR = 'ERR-9001',
  VALIDATION_ERROR = 'ERR-9002',
  UNAUTHORIZED = 'ERR-9003',
  FORBIDDEN = 'ERR-9004',
  BAD_REQUEST = 'ERR-9005',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  // Customer
  [ErrorCode.CUSTOMER_NOT_FOUND]: 'Cliente no encontrado',
  [ErrorCode.CUSTOMER_ALREADY_EXISTS]: 'El cliente ya existe',
  [ErrorCode.CUSTOMER_INVALID_DATA]: 'Datos del cliente inválidos',
  [ErrorCode.CUSTOMER_UPDATE_FAILED]: 'Error al actualizar el cliente',
  [ErrorCode.CUSTOMER_DELETE_FAILED]: 'Error al eliminar el cliente',

  // Product
  [ErrorCode.PRODUCT_NOT_FOUND]: 'Producto no encontrado',
  [ErrorCode.PRODUCT_OUT_OF_STOCK]: 'Producto sin stock disponible',
  [ErrorCode.PRODUCT_INVALID_DATA]: 'Datos del producto inválidos',
  [ErrorCode.PRODUCT_UPDATE_FAILED]: 'Error al actualizar el producto',
  [ErrorCode.PRODUCT_DELETE_FAILED]: 'Error al eliminar el producto',

  // Transaction
  [ErrorCode.TRANSACTION_NOT_FOUND]: 'Transacción no encontrada',
  [ErrorCode.TRANSACTION_INVALID_DATA]: 'Datos de transacción inválidos',
  [ErrorCode.TRANSACTION_PAYMENT_FAILED]: 'Error al procesar el pago',
  [ErrorCode.TRANSACTION_ALREADY_PROCESSED]: 'La transacción ya fue procesada',
  [ErrorCode.TRANSACTION_INVALID_STATUS]: 'Estado de transacción inválido',
  [ErrorCode.TRANSACTION_INSUFFICIENT_FUNDS]: 'Fondos insuficientes',
  [ErrorCode.TRANSACTION_UPDATE_FAILED]: 'Error al actualizar la transacción',

  // Delivery
  [ErrorCode.DELIVERY_NOT_FOUND]: 'Entrega no encontrada',
  [ErrorCode.DELIVERY_INVALID_DATA]: 'Datos de entrega inválidos',
  [ErrorCode.DELIVERY_UPDATE_FAILED]: 'Error al actualizar la entrega',
  [ErrorCode.DELIVERY_ALREADY_EXISTS]: 'La entrega ya existe',

  // Payment Gateway
  [ErrorCode.PAYMENT_GATEWAY_ERROR]: 'Error en la pasarela de pago',
  [ErrorCode.PAYMENT_GATEWAY_TIMEOUT]: 'Timeout en la pasarela de pago',
  [ErrorCode.PAYMENT_GATEWAY_INVALID_CREDENTIALS]:
    'Credenciales de pago inválidas',
  [ErrorCode.PAYMENT_GATEWAY_CARD_DECLINED]: 'Tarjeta rechazada',
  [ErrorCode.PAYMENT_GATEWAY_INSUFFICIENT_FUNDS]:
    'Fondos insuficientes en la tarjeta',

  // Database
  [ErrorCode.DATABASE_CONNECTION_ERROR]: 'Error de conexión a la base de datos',
  [ErrorCode.DATABASE_QUERY_ERROR]: 'Error en la consulta a la base de datos',
  [ErrorCode.DATABASE_CONSTRAINT_ERROR]:
    'Error de restricción en la base de datos',

  // General
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
  [ErrorCode.VALIDATION_ERROR]: 'Error de validación',
  [ErrorCode.UNAUTHORIZED]: 'No autorizado',
  [ErrorCode.FORBIDDEN]: 'Acceso prohibido',
  [ErrorCode.BAD_REQUEST]: 'Solicitud inválida',
};
