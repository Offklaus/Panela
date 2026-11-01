// Erro esperado da aplicação, convertido no formato único de erro da API (contracts/api.md).
export class AppError extends Error {
  constructor(status, code, message, { field, extra } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.field = field;
    this.extra = extra;
  }
}
