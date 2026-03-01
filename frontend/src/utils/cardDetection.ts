export type CardType = 
  | 'visa' 
  | 'mastercard' 
  | 'unknown';

export interface CardInfo {
  type: CardType;
  name: string;
  lengths: number[];
  cvcLength: number[];
  icon: string;
  color: string;
}

const CARD_PATTERNS: Record<CardType, RegExp> = {
  visa: /^4/,
  mastercard: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
  unknown: /^$/,
};

const CARD_INFO: Record<CardType, CardInfo> = {
  visa: {
    type: 'visa',
    name: 'Visa',
    lengths: [16],
    cvcLength: [3],
    icon: '💳',
    color: '#1A1F71',
  },
  mastercard: {
    type: 'mastercard',
    name: 'Mastercard',
    lengths: [16],
    cvcLength: [3],
    icon: '💳',
    color: '#EB001B',
  },
  unknown: {
    type: 'unknown',
    name: 'Tarjeta no aceptada',
    lengths: [16],
    cvcLength: [3],
    icon: '❌',
    color: '#DC2626',
  },
};

/**
 * Detecta el tipo de tarjeta basándose en el número
 */
export const detectCardType = (cardNumber: string): CardType => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (type !== 'unknown' && pattern.test(cleanNumber)) {
      return type as CardType;
    }
  }
  
  return 'unknown';
};

/**
 * Obtiene información sobre un tipo de tarjeta
 */
export const getCardInfo = (cardType: CardType): CardInfo => {
  return CARD_INFO[cardType];
};

/**
 * Detecta el tipo de tarjeta y retorna su información
 */
export const detectCardInfo = (cardNumber: string): CardInfo => {
  const cardType = detectCardType(cardNumber);
  return getCardInfo(cardType);
};

/**
 * Valida si un número de tarjeta tiene la longitud correcta para su tipo
 */
export const validateCardLength = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const cardInfo = detectCardInfo(cleanNumber);
  
  return cardInfo.lengths.includes(cleanNumber.length);
};

/**
 * Valida si un CVV tiene la longitud correcta para el tipo de tarjeta
 */
export const validateCvcLength = (cardNumber: string, cvc: string): boolean => {
  const cardInfo = detectCardInfo(cardNumber);
  return cardInfo.cvcLength.includes(cvc.length);
};

/**
 * Formatea el número de tarjeta con espacios (formato 4-4-4-4)
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  return cleanNumber.match(/.{1,4}/g)?.join(' ') || cleanNumber;
};

/**
 * Valida número de tarjeta usando el algoritmo de Luhn
 */
export const validateLuhn = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Recorrer desde el último dígito hacia atrás
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Limpia y valida un número de tarjeta
 */
export const cleanCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\D/g, '');
};

/**
 * Obtiene el nombre del tipo de tarjeta en español
 */
export const getCardTypeName = (cardType: CardType): string => {
  const names: Record<CardType, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    unknown: 'Solo aceptamos Visa y Mastercard',
  };
  
  return names[cardType];
};

/**
 * Verifica si el tipo de tarjeta es aceptado
 */
export const isCardTypeAccepted = (cardNumber: string): boolean => {
  const cardType = detectCardType(cardNumber);
  return cardType === 'visa' || cardType === 'mastercard';
};

/**
 * Genera un mensaje de validación personalizado
 */
export const getValidationMessage = (cardNumber: string, cvc: string): string | null => {
  const cleanNumber = cleanCardNumber(cardNumber);
  
  if (!cleanNumber) {
    return 'Ingrese un número de tarjeta';
  }
  
  const cardInfo = detectCardInfo(cleanNumber);
  
  if (cardInfo.type === 'unknown' && cleanNumber.length > 0) {
    return 'Solo aceptamos tarjetas Visa y Mastercard';
  }
  
  if (!cardInfo.lengths.includes(cleanNumber.length)) {
    return `${cardInfo.name} debe tener 16 dígitos`;
  }
  
  if (!validateLuhn(cleanNumber)) {
    return 'Número de tarjeta inválido';
  }
  
  if (cvc && !cardInfo.cvcLength.includes(cvc.length)) {
    return `CVV debe tener 3 dígitos`;
  }
  
  return null;
};
