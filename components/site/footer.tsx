import Link from "next/link";
import { cacheLife } from "next/cache";
import { Icon } from "@/components/icons";
import { HS_WATER_BILLING_URL } from "@/lib/constants";
import { getPageCopy, getServices, getSettings } from "@/lib/data/public";
import { telHref, whatsappHref } from "@/lib/utils";
import { Logo } from "./logo";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export async function Footer() {
  const [services, settings, global] = await Promise.all([
    getServices(),
    getSettings(),
    getPageCopy("global"),
  ]);

  return (
    <footer className="mt-auto bg-navy text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo onDark />
          <p className="text-sm leading-relaxed text-slate-400">{global.footerTagline}</p>
          {settings.social.length ? (
            <ul className="flex flex-wrap gap-3 text-sm">
              {settings.social.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    className="hover:text-aqua"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Services</h2>
          <ul className="space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-aqua">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Company</h2>
          <ul className="space-y-2 text-sm">
            {[
              ["/about", "About us"],
              ["/portfolio", "Portfolio"],
              ["/blog", "Blog"],
              ["/careers", "Careers"],
              ["/support", "Customer support"],
              ["/quote", "Get a quote"],
              ["/privacy", "Privacy policy"],
              ["/terms", "Terms of service"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-aqua">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={HS_WATER_BILLING_URL}
                className="inline-flex items-center gap-1 hover:text-aqua"
                rel="noopener"
              >
                HS Water Billing <Icon name="external" className="size-3.5" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Contact</h2>
          <ul className="space-y-3 text-sm">
            {settings.phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="inline-flex items-center gap-2 hover:text-aqua">
                  <Icon name="phone" className="size-4 text-aqua" /> {p}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 hover:text-aqua"
              >
                <Icon name="mail" className="size-4 text-aqua" /> {settings.email}
              </a>
            </li>
            {settings.whatsapp ? (
              <li>
                <a
                  href={whatsappHref(settings.whatsapp)}
                  className="inline-flex items-center gap-2 hover:text-aqua"
                  rel="noopener"
                >
                  <Icon name="whatsapp" className="size-4 text-aqua" /> WhatsApp us
                </a>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-aqua" /> {settings.address}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <Year /> {settings.companyName}. All rights reserved.
          </p>
          <p>Westlands, Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
