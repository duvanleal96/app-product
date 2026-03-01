import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { TransactionService } from '../../application/transaction.service';
import { WompiService } from '../wompi/wompi.service';
import { WebhookEventDto } from '../../application/dto/webhook-event.dto';

const mockWebhookEvent: WebhookEventDto = {
  event: 'transaction.updated',
  data: {
    transaction: {
      id: 'wompi-123',
      amount_in_cents: 207000,
      reference: 'txn-ref-001',
      customer_email: 'john@example.com',
      currency: 'COP',
      payment_method_type: 'CARD',
      status: 'APPROVED',
    },
  },
  environment: 'test',
  signature: {
    properties: ['transaction.id', 'transaction.status'],
    checksum: 'abc123',
  },
  timestamp: 1700000000,
  sent_at: '2026-03-01T00:00:00.000Z',
};

describe('WebhookController', () => {
  let controller: WebhookController;
  let transactionService: TransactionService;
  let wompiService: WompiService;

  const mockTransactionService = {
    updateTransactionFromWebhook: jest.fn(),
  };

  const mockWompiService = {
    verifyEventSignature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: WompiService, useValue: mockWompiService },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    transactionService = module.get<TransactionService>(TransactionService);
    wompiService = module.get<WompiService>(WompiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWompiWebhook', () => {
    it('should process transaction.updated event and return received: true', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(true);
      mockTransactionService.updateTransactionFromWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWompiWebhook(mockWebhookEvent, 'valid-checksum');

      expect(result).toEqual({ received: true });
      expect(wompiService.verifyEventSignature).toHaveBeenCalledWith(
        mockWebhookEvent,
        'valid-checksum',
      );
      expect(transactionService.updateTransactionFromWebhook).toHaveBeenCalledWith(
        mockWebhookEvent.data.transaction.reference,
        mockWebhookEvent.data.transaction.status,
        mockWebhookEvent.data.transaction.id,
        mockWebhookEvent,
      );
    });

    it('should throw UnauthorizedException when signature is invalid', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(false);

      await expect(
        controller.handleWompiWebhook(mockWebhookEvent, 'invalid-checksum'),
      ).rejects.toThrow(UnauthorizedException);

      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should return received: true when no checksum header provided', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(true);
      mockTransactionService.updateTransactionFromWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWompiWebhook(mockWebhookEvent);

      expect(result).toEqual({ received: true });
      expect(wompiService.verifyEventSignature).toHaveBeenCalledWith(
        mockWebhookEvent,
        undefined,
      );
    });

    it('should handle nequi_token.updated event and return received: true', async () => {
      const nequiEvent = { ...mockWebhookEvent, event: 'nequi_token.updated' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(nequiEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should handle bancolombia_transfer_token.updated event and return received: true', async () => {
      const bancolombiaEvent = { ...mockWebhookEvent, event: 'bancolombia_transfer_token.updated' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(bancolombiaEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should handle unknown event type and return received: true', async () => {
      const unknownEvent = { ...mockWebhookEvent, event: 'unknown.event' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(unknownEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
    });

    it('should return received: true and not rethrow non-auth errors from updateTransactionFromWebhook', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(true);
      mockTransactionService.updateTransactionFromWebhook.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.handleWompiWebhook(mockWebhookEvent, 'valid-checksum');

      expect(result).toEqual({ received: true });
    });
  });
});
