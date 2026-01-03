// apps/backend/src/config/supabase.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Create Supabase client with service role key (full access)
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create Supabase client with anon key (for public operations)
export const supabaseClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Storage helper functions
export const storage = {
  bucket: env.SUPABASE_STORAGE_BUCKET,

  /**
   * Upload a file to Supabase Storage
   */
  async upload(
    path: string,
    file: Buffer | Blob,
    options?: { contentType?: string; upsert?: boolean }
  ) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  async delete(path: string) {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Delete multiple files from storage
   */
  async deleteMany(paths: string[]) {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove(paths);

    if (error) throw error;
  },

  /**
   * List files in a folder
   */
  async list(folder: string, options?: { limit?: number; offset?: number }) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .list(folder, {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Generate a signed URL for private files
   */
  async getSignedUrl(path: string, expiresIn: number = 3600) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },
};

export default supabaseAdmin;
