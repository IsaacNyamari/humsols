import { actorFor } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { isSameOrigin } from "@/lib/request";
import { writeAudit } from "@/lib/services/audit";
import { getStorage, sniffImage } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const actor = await actorFor("content:write");
  if (!actor) return Response.json({ error: "Not allowed" }, { status: 403 });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > env.maxUploadBytes + 64 * 1024) {
    return Response.json(
      { error: `File is too large (max ${env.maxUploadBytes / 1024 / 1024} MB).` },
      { status: 413 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!file) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > env.maxUploadBytes) {
    return Response.json(
      { error: `File is too large (max ${env.maxUploadBytes / 1024 / 1024} MB).` },
      { status: 413 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(data);
  if (!ext)
    return Response.json(
      { error: "Only PNG, JPEG, WebP or GIF images are allowed." },
      { status: 415 },
    );

  const saved = await getStorage().save(data, ext);
  await writeAudit(actor, "upload", "Upload", saved.key, {
    name: file.name.slice(0, 200),
    size: file.size,
  });
  return Response.json({ url: saved.url }, { status: 201 });
}
