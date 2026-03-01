import * as crypto from 'crypto';

jest.mock('../../../config/wompi.config', () => ({
  wompiConfig: {
    baseUrl: 'https://sandbox.wompi.co/v1',
    publicKey: 'pub_test_key',
    privateKey: 'prv_test_key',
    integritySecret: 'test_integrity_secret',
    eventsSecret: 'test_events_secret',
    currency: 'COP',
    environment: 'sandbox',
  },
}));

import { WompiService } from './wompi.service';

const mockFetchResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(() => {
    service = new WompiService();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('tokenizeCard', () => {
    const cardData = {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '28',
      card_holder: 'John Doe',
    };

    it('should return token id on success', async () => {
      const mockResponse = { data: { id: 'tok_test_123', status: 'CREATED' } };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      const result = await service.tokenizeCard(cardData);

      expect(result).toBe('tok_test_123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/tokens/cards',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer pub_test_key' }),
        }),
      );
    });

    it('should throw CustomException when API returns error', async () => {
      const errorResponse = { error: { reason: 'Card declined' } };
      jest.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse(errorResponse, false, 400) as any,
      );

      await expect(service.tokenizeCard(cardData)).rejects.toThrow();
    });

    it('should throw CustomException on network error', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(service.tokenizeCard(cardData)).rejects.toThrow();
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token on success', async () => {
      const mockResponse = {
        data: {
          presigned_acceptance: { acceptance_token: 'acc_token_abc' },
        },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      const result = await service.getAcceptanceToken();

      expect(result).toBe('acc_token_abc');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/merchants/pub_test_key',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should throw when API response is not ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({}, false, 500) as any,
      );

      await expect(service.getAcceptanceToken()).rejects.toThrow();
    });

    it('should throw when acceptance token is missing in response', async () => {
      const mockResponse = { data: { presigned_acceptance: {} } };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      await expect(service.getAcceptanceToken()).rejects.toThrow();
    });
  });

  describe('createTransaction', () => {
    const transactionData = {
      acceptance_token: 'acc_token',
      amount_in_cents: 207000,
      currency: 'COP',
      customer_email: 'john@example.com',
      reference: 'ref-001',
      payment_method: { type: 'CARD', installments: 1, token: 'tok_123' },
    };

    it('should create and return transaction on success', async () => {
      const mockResponse = {
        data: { id: 'wompi-txn-001', status: 'PENDING' },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      const result = await service.createTransaction(transactionData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/transactions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer prv_test_key' }),
        }),
      );
    });

    it('should throw CustomException when transaction fails', async () => {
      const errorResponse = { data: { status_message: 'Payment declined' } };
      jest.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse(errorResponse, false, 422) as any,
      );

      await expect(service.createTransaction(transactionData)).rejects.toThrow();
    });

    it('should throw CustomException on network error', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Timeout'));

      await expect(service.createTransaction(transactionData)).rejects.toThrow();
    });
  });

  describe('getTransaction', () => {
    it('should return transaction data on success', async () => {
      const mockResponse = {
        data: { id: 'wompi-txn-001', status: 'APPROVED' },
      };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      const result = await service.getTransaction('wompi-txn-001');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/transactions/wompi-txn-001',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should throw CustomException when transaction not found', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({}, false, 404) as any,
      );

      await expect(service.getTransaction('invalid-id')).rejects.toThrow();
    });
  });

  describe('waitForTransactionStatus', () => {
    it('should return transaction immediately when status is not PENDING', async () => {
      const mockResponse = { data: { id: 'wompi-001', status: 'APPROVED' } };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(mockResponse) as any);

      const result = await service.waitForTransactionStatus('wompi-001', 3, 0);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry while PENDING and return when status changes', async () => {
      const pendingResponse = { data: { id: 'wompi-001', status: 'PENDING' } };
      const approvedResponse = { data: { id: 'wompi-001', status: 'APPROVED' } };

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(mockFetchResponse(pendingResponse) as any)
        .mockResolvedValueOnce(mockFetchResponse(approvedResponse) as any);

      const result = await service.waitForTransactionStatus('wompi-001', 3, 0);

      expect(result).toEqual(approvedResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return last PENDING response after max retries', async () => {
      const pendingResponse = { data: { id: 'wompi-001', status: 'PENDING' } };
      jest.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse(pendingResponse) as any);

      const result = await service.waitForTransactionStatus('wompi-001', 2, 0);

      expect(result.data.status).toBe('PENDING');
      // maxRetries=2 loops + 1 final call
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('verifyEventSignature', () => {
    const buildChecksum = (values: string, timestamp: number, secret: string) =>
      crypto
        .createHash('sha256')
        .update(`${values}${timestamp}${secret}`)
        .digest('hex')
        .toUpperCase();

    it('should return true for a valid signature', () => {
      const eventData = {
        event: 'transaction.updated',
        data: {
          transaction: { id: 'wompi-123', status: 'APPROVED' },
        },
        timestamp: 1700000000,
        signature: {
          properties: ['transaction.id', 'transaction.status'],
          checksum: buildChecksum('wompi-123APPROVED', 1700000000, 'test_events_secret'),
        },
      };

      const result = service.verifyEventSignature(eventData);

      expect(result).toBe(true);
    });

    it('should return false for an invalid checksum', () => {
      const eventData = {
        event: 'transaction.updated',
        data: { transaction: { id: 'wompi-123', status: 'APPROVED' } },
        timestamp: 1700000000,
        signature: {
          properties: ['transaction.id', 'transaction.status'],
          checksum: 'INVALID_CHECKSUM',
        },
      };

      const result = service.verifyEventSignature(eventData);

      expect(result).toBe(false);
    });

    it('should return false when no checksum is provided', () => {
      const eventData = {
        event: 'transaction.updated',
        data: { transaction: { id: 'wompi-123', status: 'APPROVED' } },
        timestamp: 1700000000,
        signature: { properties: [], checksum: '' },
      };

      const result = service.verifyEventSignature(eventData, undefined);

      expect(result).toBe(false);
    });

    it('should use header checksum over body checksum when provided', () => {
      const headerChecksum = buildChecksum(
        'wompi-123APPROVED',
        1700000000,
        'test_events_secret',
      );

      const eventData = {
        event: 'transaction.updated',
        data: { transaction: { id: 'wompi-123', status: 'APPROVED' } },
        timestamp: 1700000000,
        signature: {
          properties: ['transaction.id', 'transaction.status'],
          checksum: 'wrong_body_checksum',
        },
      };

      const result = service.verifyEventSignature(eventData, headerChecksum);

      expect(result).toBe(true);
    });

    it('should return false on unexpected errors', () => {
      const result = service.verifyEventSignature(null);

      expect(result).toBe(false);
    });
  });
});
