import morgan from 'morgan';

const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

/** Never read URLs, headers, IPs or bodies into the access log. */
export const httpLogFormat: morgan.FormatFn = (tokens, req, res) => {
  const method = tokens.method(req, res) || '';
  const status = Number(tokens.status(req, res));
  const duration = Number(tokens['response-time'](req, res));
  return JSON.stringify({
    event: 'http.request',
    method: METHODS.has(method) ? method : 'OTHER',
    status: Number.isInteger(status) && status >= 100 && status <= 599 ? status : null,
    durationMs: Number.isFinite(duration) && duration >= 0 ? duration : null,
  });
};

export const httpLogger = morgan(httpLogFormat);
