import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Human Solutions (HumSols) — Software, websites, CCTV and internet in Nairobi",
    template: "%s | HumSols",
  },
  description:
    "HumSols builds web applications, custom software, billing systems and websites, and installs CCTV and internet for businesses and homes in Kenya.",
  applicationName: "Human Solutions",
  openGraph: { type: "website", siteName: "Human Solutions", locale: "en_KE" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#010C1B" },
  ],
};

// Runs before first paint so the correct theme shows without a flash.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=s==='dark'||(s!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-KE"
      className={`${jakarta.variable} antialiased`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
