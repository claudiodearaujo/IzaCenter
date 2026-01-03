export const storageMock = {
  upload: jest.fn().mockResolvedValue({ 
    path: 'test/file.jpg',
    error: null,
  }),
  getPublicUrl: jest.fn().mockReturnValue({
    data: { publicUrl: 'https://storage.supabase.co/test/file.jpg' },
  }),
  remove: jest.fn().mockResolvedValue({ error: null }),
  list: jest.fn().mockResolvedValue({ data: [], error: null }),
  createSignedUrl: jest.fn().mockResolvedValue({
    data: { signedUrl: 'https://signed-url.supabase.co/test' },
    error: null,
  }),
};

export const supabaseClientMock = {
  storage: {
    from: jest.fn().mockReturnValue(storageMock),
  },
};

jest.mock('../../config/supabase', () => ({
  storage: storageMock,
  supabaseAdmin: supabaseClientMock,
  supabaseClient: supabaseClientMock,
}));
