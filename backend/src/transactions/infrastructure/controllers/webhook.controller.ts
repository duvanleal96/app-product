import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TransactionService } from '../../application/transaction.service';
import { WompiService } from '../wompi/wompi.service';
import { WebhookEventDto } from '../../application/dto/webhook-event.dto';
import { LoggerService } from '../../../shared/infrastructure/logger/logger.service';

/**
 * Controller para recibir webhooks de Wompi
 * 
 * Wompi envía notificaciones POST a esta URL cuando cambia el estado de una transacción.
 * Debemos responder con HTTP 200 para confirmar la recepción.
 * Si no respondemos 200, Wompi reintentará hasta 3 veces en 24 horas.
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger: LoggerService;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly wompiService: WompiService,
  ) {
    this.logger = new LoggerService();
    this.logger.setContext('WebhookController');
  }

  /**
   * Endpoint para recibir eventos de Wompi
   * URL a configurar en Wompi Dashboard: https://tu-dominio.com/webhooks/wompi
   * 
   * @param eventData - Datos del evento enviado por Wompi
   * @param checksum - Firma SHA256 enviada en el header X-Event-Checksum
   */
  @Post('wompi')
  @HttpCode(HttpStatus.OK) // Wompi espera HTTP 200
  async handleWompiWebhook(
    @Body() eventData: WebhookEventDto,
    @Headers('x-event-checksum') checksum?: string,
  ): Promise<{ received: boolean }> {
    this.logger.log(
      `Received webhook event: ${eventData.event} for transaction ${eventData.data.transaction.reference}`,
    );
    this.logger.log(`Event data: ${JSON.stringify(eventData, null, 2)}`);

    try {
      // Paso 1: Validar la firma de seguridad
      const isValidSignature = this.wompiService.verifyEventSignature(
        eventData,
        checksum || undefined,
      );

      if (!isValidSignature) {
        this.logger.error(
          'Invalid webhook signature - potential security issue',
          undefined,
          'WebhookController',
        );
        throw new UnauthorizedException('Invalid signature');
      }

      this.logger.log('Webhook signature verified successfully');

      // Paso 2: Procesar el evento según su tipo
      switch (eventData.event) {
        case 'transaction.updated':
          await this.handleTransactionUpdated(eventData);
          break;

        case 'nequi_token.updated':
          this.logger.log('Nequi token event received (not implemented)');
          break;

        case 'bancolombia_transfer_token.updated':
          this.logger.log(
            'Bancolombia transfer event received (not implemented)',
          );
          break;

        default:
          this.logger.warn(`Unknown event type: ${eventData.event}`);
      }

      // Paso 3: Responder con HTTP 200 para confirmar recepción
      this.logger.log(
        `Webhook processed successfully for transaction ${eventData.data.transaction.reference}`,
      );

      return { received: true };
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
        'WebhookController',
      );

      // Importante: Aún si hay error, respondemos 200 para evitar reintentos infinitos
      // si el error no es recuperable
      if (error instanceof UnauthorizedException) {
        throw error; // Esto retorna 401
      }

      // Para otros errores, registramos pero devolvemos 200
      // Esto evita que Wompi reintente si es un error de lógica interna
      return { received: true };
    }
  }

  /**
   * Maneja el evento transaction.updated
   * Este es el evento más importante: indica que el estado de una transacción cambió
   */
  private async handleTransactionUpdated(
    eventData: WebhookEventDto,
  ): Promise<void> {
    const { transaction } = eventData.data;

    this.logger.log(
      `Processing transaction.updated event for ${transaction.reference}`,
    );
    this.logger.log(`Wompi Transaction ID: ${transaction.id}`);
    this.logger.log(`New Status: ${transaction.status}`);
    this.logger.log(`Amount: ${transaction.amount_in_cents / 100} COP`);

    try {
      // Actualizar el estado de la transacción en nuestra base de datos
      await this.transactionService.updateTransactionFromWebhook(
        transaction.reference, // Nuestro ID de transacción
        transaction.status,
        transaction.id, // ID de Wompi
        eventData, // Todo el evento para logging
      );

      this.logger.log(
        `Transaction ${transaction.reference} updated to ${transaction.status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update transaction ${transaction.reference}: ${error.message}`,
        error.stack,
        'WebhookController',
      );
      throw error;
    }
  }
}
