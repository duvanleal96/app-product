import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../../domain/error-codes.enum';

export class CustomException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly details?: any,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(
      {
        statusCode: httpStatus,
        errorCode,
        message: ErrorMessages[errorCode],
        details,
        timestamp: new Date().toISOString(),
      },
      httpStatus,
    );
  }
}
