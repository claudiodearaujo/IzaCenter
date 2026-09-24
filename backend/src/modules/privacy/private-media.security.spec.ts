const getBucket = jest.fn();
const upload = jest.fn();
const createSignedUrl = jest.fn();
jest.mock('@supabase/supabase-js', () => ({ createClient: () => ({ storage: {
  getBucket: (...args: unknown[]) => getBucket(...args),
  from: () => ({ upload, createSignedUrl }),
} }) }));
import { privateMedia } from '../../config/supabase';

describe('private delivery media', () => {
  beforeEach(() => {
    getBucket.mockResolvedValue({ data: { public: false }, error: null });
    upload.mockResolvedValue({ error: null });
    createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://storage.example/signed' }, error: null });
  });
  it('refuses public/missing buckets without uploading', async () => {
    for (const data of [null, { public: true }]) {
      getBucket.mockResolvedValue({ data, error: null });
      await expect(privateMedia.upload('t/d/audio/f.mp3', Buffer.from('fixture'), 'audio/mpeg')).rejects.toThrow();
    }
    expect(upload).not.toHaveBeenCalled();
  });
  it('stores a private object reference, never a public/signed URL', async () => {
    expect(await privateMedia.upload('t/d/audio/f.mp3', Buffer.from('fixture'), 'audio/mpeg')).toBe('private://t/d/audio/f.mp3');
    expect(upload).toHaveBeenCalledWith('t/d/audio/f.mp3', expect.any(Buffer), { contentType: 'audio/mpeg', upsert: false });
  });
  it('signs only matching tenant and delivery paths with bounded expiry', async () => {
    await expect(privateMedia.resolve('private://foreign/d/audio/f.mp3', 't', 'd')).rejects.toThrow();
    await expect(privateMedia.resolve('private://t/other/audio/f.mp3', 't', 'd')).rejects.toThrow();
    expect(createSignedUrl).not.toHaveBeenCalled();
    expect(await privateMedia.resolve('private://t/d/audio/f.mp3', 't', 'd')).toBe('https://storage.example/signed');
    expect(createSignedUrl).toHaveBeenCalledWith('t/d/audio/f.mp3', 300);
  });
});
