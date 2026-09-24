// Retain only static route vocabulary; IDs, emails and arbitrary URL segments disappear.
const routeWords = new Set(('api v1 auth login register logout refresh reset-password forgot-password change-password profile privacy export requests me contact admin audit retention report incidents users products orders readings deliveries appointments categories testimonials settings dashboard notifications tenant current workspaces onboarding professional billing subscription checkout portal plans health docs docs.json avatar cover upload-audio audio status').split(' '));
export function safeLogPath(path: string): string {
  return path.split(/[?#]/, 1)[0].split('/').map(part => !part || routeWords.has(part) ? part : ':value').join('/');
}
export function minimizeSentryEvent<T extends Record<string, any>>(event: T): T {
  const safe: Record<string, any> = { ...event };
  safe.request = event.request ? { method: event.request.method } : undefined;
  safe.user = undefined;
  safe.breadcrumbs = undefined;
  safe.extra = undefined;
  safe.message = event.message ? 'Application error' : undefined;
  safe.transaction = undefined;
  if (event.exception?.values) {
    safe.exception = { values: event.exception.values.map((value: any) => ({
      type: 'ApplicationError', value: 'Error details omitted',
      stacktrace: value.stacktrace ? { frames: value.stacktrace.frames?.map((frame: any) => ({
        filename: frame.filename?.split(/[?#]/, 1)[0], function: frame.function,
        lineno: frame.lineno, colno: frame.colno, in_app: frame.in_app,
      })) } : undefined,
    })) };
  }
  return safe as T;
}
