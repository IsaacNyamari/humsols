import { headers } from "next/headers";
import { clientIp } from "@/lib/rate-limit";

export async function clientIpFromHeaders() {
  return clientIp(await headers());
}
