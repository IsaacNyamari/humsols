import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const kes = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export function formatKes(amount: number) {
  return kes.format(amount);
}

export function formatDate(iso: string | Date | null | undefined, withTime = false) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Nairobi",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Convert lean Mongoose output into plain JSON (ObjectId -> string, Date -> ISO). */
export function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value, (key, v) => (key === "__v" ? undefined : v))) as T;
}

/** Map `_id` to `id` on plain documents (recursively for arrays). */
export function withId<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id) };
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function placeholderText(value: string | undefined | null) {
  return Boolean(value && value.includes("[PLACEHOLDER"));
}
