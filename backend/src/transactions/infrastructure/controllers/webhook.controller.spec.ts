import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { TransactionService } from '../../application/transaction.service';
import { WompiService } from '../wompi/wompi.service';
import { WebhookEventDto } from '../../application/dto/webhook-event.dto';
import { mockWebhookEventDto } from '../../test-cases';

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

      const result = await controller.handleWompiWebhook(mockWebhookEventDto, 'valid-checksum');

      expect(result).toEqual({ received: true });
      expect(wompiService.verifyEventSignature).toHaveBeenCalledWith(
        mockWebhookEventDto,
        'valid-checksum',
      );
      expect(transactionService.updateTransactionFromWebhook).toHaveBeenCalledWith(
        mockWebhookEventDto.data.transaction.reference,
        mockWebhookEventDto.data.transaction.status,
        mockWebhookEventDto.data.transaction.id,
        mockWebhookEventDto,
      );
    });

    it('should throw UnauthorizedException when signature is invalid', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(false);

      await expect(
        controller.handleWompiWebhook(mockWebhookEventDto, 'invalid-checksum'),
      ).rejects.toThrow(UnauthorizedException);

      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should return received: true when no checksum header provided', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(true);
      mockTransactionService.updateTransactionFromWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWompiWebhook(mockWebhookEventDto);

      expect(result).toEqual({ received: true });
      expect(wompiService.verifyEventSignature).toHaveBeenCalledWith(
        mockWebhookEventDto,
        undefined,
      );
    });

    it('should handle nequi_token.updated event and return received: true', async () => {
      const nequiEvent = { ...mockWebhookEventDto, event: 'nequi_token.updated' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(nequiEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should handle bancolombia_transfer_token.updated event and return received: true', async () => {
      const bancolombiaEvent = { ...mockWebhookEventDto, event: 'bancolombia_transfer_token.updated' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(bancolombiaEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
      expect(transactionService.updateTransactionFromWebhook).not.toHaveBeenCalled();
    });

    it('should handle unknown event type and return received: true', async () => {
      const unknownEvent = { ...mockWebhookEventDto, event: 'unknown.event' };
      mockWompiService.verifyEventSignature.mockReturnValue(true);

      const result = await controller.handleWompiWebhook(unknownEvent as WebhookEventDto);

      expect(result).toEqual({ received: true });
    });

    it('should return received: true and not rethrow non-auth errors from updateTransactionFromWebhook', async () => {
      mockWompiService.verifyEventSignature.mockReturnValue(true);
      mockTransactionService.updateTransactionFromWebhook.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.handleWompiWebhook(mockWebhookEventDto, 'valid-checksum');

      expect(result).toEqual({ received: true });
    });
  });
});
