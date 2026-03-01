import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ErrorCode } from '../../domain/error-codes.enum';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    const logContext = context || this.context;
    console.log(`[${new Date().toISOString()}] [LOG] [${logContext}] ${message}`);
  }

  error(message: string, trace?: string, context?: string, errorCode?: ErrorCode): void {
    const logContext = context || this.context;
    const errorCodeStr = errorCode ? `[${errorCode}]` : '';
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${logContext}] ${errorCodeStr} ${message}`,
    );
    if (trace) {
      console.error(`Stack trace: ${trace}`);
    }
  }

  warn(message: string, context?: string): void {
    const logContext = context || this.context;
    console.warn(`[${new Date().toISOString()}] [WARN] [${logContext}] ${message}`);
  }

  debug(message: string, context?: string): void {
    const logContext = context || this.context;
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${logContext}] ${message}`);
  }

  verbose(message: string, context?: string): void {
    const logContext = context || this.context;
    console.log(`[${new Date().toISOString()}] [VERBOSE] [${logContext}] ${message}`);
  }

  logMethodEntry(methodName: string, params?: any): void {
    const context = this.context;
    const paramsStr = params ? JSON.stringify(params) : 'no params';
    console.log(
      `[${new Date().toISOString()}] [ENTRY] [${context}] ${methodName}(${paramsStr})`,
    );
  }

  logMethodExit(methodName: string, result?: any): void {
    const context = this.context;
    const resultStr = result ? 'with result' : 'void';
    console.log(
      `[${new Date().toISOString()}] [EXIT] [${context}] ${methodName} ${resultStr}`,
    );
  }
}
