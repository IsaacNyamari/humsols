import { Icon } from "@/components/icons";
import { getSettings } from "@/lib/data/public";
import { whatsappHref } from "@/lib/utils";

/** Floating WhatsApp button, shown on phones and tablets only. */
export async function WhatsAppButton() {
  const settings = await getSettings();
  if (!settings.whatsapp) return null;
  return (
    <a
      href={whatsappHref(settings.whatsapp, "Hello Human Solutions, I'd like to ask about ")}
      className="fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-[#0b2a17] shadow-lg ring-4 ring-white/70 transition-transform hover:scale-105 lg:hidden dark:ring-navy/70"
      aria-label="Chat with us on WhatsApp"
      rel="noopener"
    >
      <Icon name="whatsapp" className="size-7" />
    </a>
  );
}
