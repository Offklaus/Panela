import { AppError } from '../utils/AppError.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.field ? { field: err.field } : {}),
        ...err.extra,
      },
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' },
    });
  }

  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Algo deu errado. Tente de novo.' },
  });
}
