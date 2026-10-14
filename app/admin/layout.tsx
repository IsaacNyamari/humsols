import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | HumSols admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <ToastProvider>{children}</ToastProvider>;
}
