import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const STORAGE_BUCKET = "customer-media";

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const kindRaw = typeof form.get("kind") === "string" ? String(form.get("kind")) : "image";
    const kind = ["avatar", "front", "back"].includes(kindRaw) ? kindRaw : "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "An image file is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image exceeds the 2MB limit." }, { status: 400 });
    }

    const ext = extensionForType(file.type);
    const storagePath = `${user.id}/${kind}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    // 1. Attempt Supabase Storage
    try {
      let bucket = STORAGE_BUCKET;
      let uploadRes = await supabase.storage.from(bucket).upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

      if (uploadRes.error) {
        const { data: buckets } = await supabase.storage.listBuckets();
        const fallback = (buckets || []).find((b) => b.public) || (buckets || [])[0];
        if (fallback && fallback.name !== bucket) {
          bucket = fallback.name;
          uploadRes = await supabase.storage.from(bucket).upload(storagePath, bytes, {
            contentType: file.type,
            upsert: false,
          });
        }
      }

      if (!uploadRes.error) {
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        const url = publicData?.publicUrl;
        if (url) {
          return NextResponse.json({ success: true, url, kind, path: storagePath, bucket });
        }
      }
    } catch (storageErr: any) {
      console.warn("Supabase storage upload attempt:", storageErr?.message);
    }

    // 2. Resilient Local Storage Fallback in public/uploads/cards/
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "cards");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFileName = `${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const localFilePath = path.join(uploadDir, localFileName);
      await fs.writeFile(localFilePath, bytes);

      const publicUrl = `/uploads/cards/${localFileName}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        kind,
        path: publicUrl,
        bucket: "local",
      });
    } catch (fsErr: any) {
      console.error("Local file storage fallback failed:", fsErr?.message);
      return NextResponse.json(
        { error: "Could not save uploaded image to storage." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("POST /api/admin/media unexpected error:", err?.message);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
