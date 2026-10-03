import { supabase } from "@/lib/supabase";

const BUCKET = "uploads";

export async function uploadFile(file: File): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${crypto.randomUUID()}-${safeName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        reject(error);
        return;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      resolve(data.publicUrl);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}