import { connection } from "next/server";
import { getStorage, IMAGE_TYPES, isValidKey, type ImageExt } from "@/lib/storage";

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...key]">) {
  await connection(); // read from disk at request time
  const { key: parts } = await params;
  const key = parts.join("/");
  if (!isValidKey(key)) return new Response("Not found", { status: 404 });

  const data = await getStorage().read(key);
  if (!data) return new Response("Not found", { status: 404 });

  const ext = key.split(".").pop() as ImageExt;
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": IMAGE_TYPES[ext],
      // Keys are random and never reused, so the file can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
