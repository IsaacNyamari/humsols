import { randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/**
 * Upload storage behind a small interface so it can move to S3 (or similar)
 * later without touching callers. Keys look like "2026/10/ab12cd34.webp" and
 * are served at /uploads/<key>.
 */
export interface Storage {
  save(data: Buffer, ext: string): Promise<{ key: string; url: string }>;
  read(key: string): Promise<Buffer | null>;
}

export const IMAGE_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
} as const;
export type ImageExt = keyof typeof IMAGE_TYPES;

/** Detect the real image type from magic bytes (never trust the file name or browser MIME type). */
export function sniffImage(buf: Buffer): ImageExt | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return "webp";
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a")
    return "gif";
  return null;
}

const KEY_PATTERN = /^\d{4}\/\d{2}\/[a-f0-9]{16}\.(png|jpg|webp|gif)$/;

export function isValidKey(key: string) {
  return KEY_PATTERN.test(key);
}

class LocalDiskStorage implements Storage {
  constructor(private readonly root: string) {}

  async save(data: Buffer, ext: string) {
    const now = new Date();
    const dir = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const key = `${dir}/${randomBytes(8).toString("hex")}.${ext}`;
    await mkdir(path.join(this.root, dir), { recursive: true });
    await writeFile(path.join(this.root, key), data, { flag: "wx" });
    return { key, url: `/uploads/${key}` };
  }

  async read(key: string) {
    if (!isValidKey(key)) return null; // also blocks path traversal
    const file = path.join(this.root, key);
    try {
      if (!(await stat(file)).isFile()) return null;
      return await readFile(file);
    } catch {
      return null;
    }
  }
}

let storage: Storage | null = null;
export function getStorage(): Storage {
  storage ??= new LocalDiskStorage(path.resolve(env.uploadDir));
  return storage;
}
