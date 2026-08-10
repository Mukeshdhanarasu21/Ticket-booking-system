import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function apiSuccess<T>(data: T, message?: string, statusCode = 200, pagination?: ApiResponse['pagination']) {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message) body.message = message;
  if (pagination) body.pagination = pagination;
  return NextResponse.json(body, { status: statusCode });
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    logger.warn(`API Handled Error [${error.code}]: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  const err = error as any;
  const message = err?.message || 'Internal Server Error';
  const code = err?.code || 'INTERNAL_SERVER_ERROR';
  const status = typeof err?.status === 'number' ? err.status : 500;

  logger.error(`API Unhandled Exception [${code}]: ${message}`, err);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: code === 'P0006' || message.includes('SEAT_ALREADY_BOOKED') ? 'SEAT_ALREADY_BOOKED' : code,
        message: message.includes('SEAT_ALREADY_BOOKED')
          ? 'One or more selected seats are already booked'
          : message,
      },
    },
    { status: code === 'P0006' || message.includes('SEAT_ALREADY_BOOKED') ? 409 : status }
  );
}
