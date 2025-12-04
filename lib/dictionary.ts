import type { Locale } from "./i18n"

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  mn: () => import("@/dictionaries/mn.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}
