import Link from "next/link"
import type { Locale } from "@/lib/i18n"

interface FooterProps {
  dict: any
  locale: Locale
}

export function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <div>
                <p className="font-bold text-white">Mongolia Economic Forum</p>
                <p className="text-white/60 text-sm">Монголын Эдийн Засгийн Форум</p>
              </div>
            </div>
            <p className="text-white/60 text-sm max-w-md">
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{dict.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}#about`} className="text-white/60 hover:text-white text-sm transition-colors">
                  {dict.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#timeline`} className="text-white/60 hover:text-white text-sm transition-colors">
                  {dict.footer.history}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#why-participate`} className="text-white/60 hover:text-white text-sm transition-colors">
                  {dict.footer.whyParticipate}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#faq`} className="text-white/60 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{dict.footer.contact}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="mailto:info@meforum.mn" className="hover:text-white transition-colors">
                  info@meforum.mn
                </a>
              </li>
              <li>
                <a href="mailto:registration@meforum.mn" className="hover:text-white transition-colors">
                  registration@meforum.mn
                </a>
              </li>
              <li>Ulaanbaatar, Mongolia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Mongolia Economic Forum. {dict.footer.rights}
          </p>
          <Link
            href="https://www.meforum.mn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            www.meforum.mn
          </Link>
        </div>
      </div>
    </footer>
  )
}
