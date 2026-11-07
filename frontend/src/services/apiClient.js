// Único ponto do frontend que fala com a API (constituição, Princípio I).

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

export class ApiError extends Error {
  constructor({ status, code, message, field, retryAfterSeconds, missingPositions }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
    this.retryAfterSeconds = retryAfterSeconds;
    this.missingPositions = missingPositions;
  }
}

export async function request(method, path, body) {
  const init = { method, credentials: 'same-origin', headers: { accept: 'application/json' } };
  if (METHODS_WITH_BODY.has(method)) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body ?? {});
  }

  let response;
  try {
    response = await fetch(`/api${path}`, init);
  } catch {
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message:
        method === 'GET'
          ? 'Não foi possível carregar. Verifique a conexão.'
          : 'Não foi possível salvar. Verifique a conexão.',
    });
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = data?.error ?? {};
    throw new ApiError({
      status: response.status,
      code: error.code ?? 'INTERNAL_ERROR',
      message: error.message ?? 'Algo deu errado. Tente de novo.',
      field: error.field,
      retryAfterSeconds: error.retryAfterSeconds,
      missingPositions: error.missingPositions,
    });
  }

  return data;
}
