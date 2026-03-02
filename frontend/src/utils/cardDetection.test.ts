import { describe, it, expect } from 'vitest';
import {
  detectCardType,
  getCardInfo,
  detectCardInfo,
  validateCardLength,
  validateCvcLength,
  formatCardNumber,
  validateLuhn,
  isCardTypeAccepted,
} from './cardDetection';

describe('cardDetection', () => {
  describe('detectCardType', () => {
    it('should detect Visa card', () => {
      expect(detectCardType('4242424242424242')).toBe('visa');
      expect(detectCardType('4111111111111111')).toBe('visa');
    });

    it('should detect Mastercard', () => {
      expect(detectCardType('5555555555554444')).toBe('mastercard');
      expect(detectCardType('5105105105105100')).toBe('mastercard');
      expect(detectCardType('2223000048400011')).toBe('mastercard');
    });

    it('should return unknown for invalid cards', () => {
      expect(detectCardType('1234567890123456')).toBe('unknown');
      expect(detectCardType('9999999999999999')).toBe('unknown');
    });

    it('should handle card numbers with spaces', () => {
      expect(detectCardType('4242 4242 4242 4242')).toBe('visa');
      expect(detectCardType('5555 5555 5555 4444')).toBe('mastercard');
    });
  });

  describe('getCardInfo', () => {
    it('should return correct info for Visa', () => {
      const info = getCardInfo('visa');
      expect(info.type).toBe('visa');
      expect(info.name).toBe('Visa');
      expect(info.lengths).toContain(16);
    });

    it('should return correct info for Mastercard', () => {
      const info = getCardInfo('mastercard');
      expect(info.type).toBe('mastercard');
      expect(info.name).toBe('Mastercard');
      expect(info.cvcLength).toContain(3);
    });
  });

  describe('detectCardInfo', () => {
    it('should detect and return Visa card info', () => {
      const info = detectCardInfo('4242424242424242');
      expect(info.type).toBe('visa');
      expect(info.name).toBe('Visa');
    });

    it('should detect and return Mastercard card info', () => {
      const info = detectCardInfo('5555555555554444');
      expect(info.type).toBe('mastercard');
      expect(info.name).toBe('Mastercard');
    });
  });

  describe('validateCardLength', () => {
    it('should validate correct Visa length', () => {
      expect(validateCardLength('4242424242424242')).toBe(true);
    });

    it('should validate correct Mastercard length', () => {
      expect(validateCardLength('5555555555554444')).toBe(true);
    });

    it('should reject incorrect length', () => {
      expect(validateCardLength('4242424242')).toBe(false);
      expect(validateCardLength('424242424242424212345')).toBe(false);
    });
  });

  describe('validateCvcLength', () => {
    it('should validate correct CVC length', () => {
      expect(validateCvcLength('4242424242424242', '123')).toBe(true);
      expect(validateCvcLength('5555555555554444', '456')).toBe(true);
    });

    it('should reject incorrect CVC length', () => {
      expect(validateCvcLength('4242424242424242', '12')).toBe(false);
      expect(validateCvcLength('4242424242424242', '12345')).toBe(false);
    });
  });

  describe('formatCardNumber', () => {
    it('should format card number with spaces', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
      expect(formatCardNumber('5555555555554444')).toBe('5555 5555 5555 4444');
    });

    it('should handle already formatted numbers', () => {
      expect(formatCardNumber('4242 4242 4242 4242')).toBe('4242 4242 4242 4242');
    });

    it('should handle partial numbers', () => {
      expect(formatCardNumber('4242')).toBe('4242');
      expect(formatCardNumber('424242')).toBe('4242 42');
    });
  });

  describe('validateLuhn', () => {
    it('should validate correct Luhn check', () => {
      expect(validateLuhn('4242424242424242')).toBe(true);
      expect(validateLuhn('5555555555554444')).toBe(true);
    });

    it('should reject incorrect Luhn check', () => {
      expect(validateLuhn('4242424242424243')).toBe(false);
      expect(validateLuhn('1234567890123456')).toBe(false);
    });

    it('should handle numbers with spaces', () => {
      expect(validateLuhn('4242 4242 4242 4242')).toBe(true);
    });
  });

  describe('isCardTypeAccepted', () => {
    it('should accept Visa cards', () => {
      expect(isCardTypeAccepted('4242424242424242')).toBe(true);
    });

    it('should accept Mastercard cards', () => {
      expect(isCardTypeAccepted('5555555555554444')).toBe(true);
    });

    it('should reject unknown cards', () => {
      expect(isCardTypeAccepted('1234567890123456')).toBe(false);
    });
  });
});
