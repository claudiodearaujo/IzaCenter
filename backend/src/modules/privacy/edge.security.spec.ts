import { safeLogPath, minimizeSentryEvent } from '../../utils/privacy-log.util';
import { validateUploadContent } from '../../middlewares/upload.middleware';
import { TenantService } from '../tenant/tenant.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import sharp from 'sharp';

describe('security boundaries', () => {
  it('removes secrets in arbitrary path, query, request, breadcrumb and exception', () => {
    expect(safeLogPath('/api/users/person@example.com?token=secret')).toBe('/api/users/:value');
    const event = minimizeSentryEvent({ request: { method: 'GET', headers: { Authorization: 'secret' }, url: 'https://example/?token=secret' }, user: { email: 'secret' }, breadcrumbs: [{ message: 'secret' }], extra: { body: 'secret' }, exception: { values: [{ value: 'secret' }] } });
    expect(JSON.stringify(event)).not.toContain('secret');
  });
  it('denies unknown hosts even with a valid-looking tenant slug', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue(null);
    expect(await new TenantService().resolve('default', 'default.attacker.invalid')).toBeNull();
    expect(prismaMock.tenant.findFirst).toHaveBeenCalledTimes(1);
  });
  it('rejects HTML disguised as image or audio', async () => {
    for (const kind of ['image', 'audio'] as const) {
      const next = jest.fn();
      await validateUploadContent(kind)({ file: { mimetype: kind === 'image' ? 'image/png' : 'audio/mpeg', buffer: Buffer.from('<script>alert(1)</script>') } } as any, {} as any, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    }
  });
  it('re-encodes real images and removes original filename', async () => {
    const buffer = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#fff' } }).png().toBuffer();
    const req = { file: { mimetype: 'image/png', originalname: 'person@example.com.png', buffer } } as any;
    const next = jest.fn();
    await validateUploadContent('image')(req, {} as any, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.file.mimetype).toBe('image/webp');
    expect(req.file.originalname).not.toContain('example');
  });
});
