import { getHeader, type H3Event } from 'h3'
import enLocale from '../../i18n/locales/en.json'
import ruLocale from '../../i18n/locales/ru.json'
import uzLocale from '../../i18n/locales/uz.json'

export type ServerLocale = 'en' | 'ru' | 'uz'

type MessageSection = 'fields' | 'validation' | 'errors' | 'success'
type MessageParams = Record<string, string | number | null | undefined>
type MessageSectionMap = Record<string, string>

interface ServerMessages {
  fields: MessageSectionMap
  validation: MessageSectionMap
  errors: MessageSectionMap
  success: MessageSectionMap
}

interface LocaleWithServer {
  server?: Partial<ServerMessages>
}

const DEFAULT_SERVER_LOCALE: ServerLocale = 'en'

const normalizeFromRaw = (rawLocale: string): ServerLocale | null => {
  const normalized = rawLocale.trim().toLowerCase()

  if (!normalized) {
    return null
  }

  if (normalized.startsWith('ru')) {
    return 'ru'
  }

  if (normalized.startsWith('uz')) {
    return 'uz'
  }

  if (normalized.startsWith('en')) {
    return 'en'
  }

  return null
}

const asServerMessages = (locale: LocaleWithServer): ServerMessages => {
  return {
    fields: locale.server?.fields ?? {},
    validation: locale.server?.validation ?? {},
    errors: locale.server?.errors ?? {},
    success: locale.server?.success ?? {}
  }
}

const messages: Record<ServerLocale, ServerMessages> = {
  en: asServerMessages(enLocale as LocaleWithServer),
  ru: asServerMessages(ruLocale as LocaleWithServer),
  uz: asServerMessages(uzLocale as LocaleWithServer)
}

const interpolate = (template: string, params: MessageParams) => {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    return value === null || value === undefined ? match : String(value)
  })
}

const getTemplate = (locale: ServerLocale, key: string): string | null => {
  const [sectionRaw, messageKey] = key.split('.', 2)

  if (!sectionRaw || !messageKey) {
    return null
  }

  const section = sectionRaw as MessageSection
  const sectionMessages = messages[locale][section]

  if (!sectionMessages) {
    return null
  }

  return sectionMessages[messageKey] ?? null
}

export const resolveEventLocale = (event: H3Event): ServerLocale => {
  const explicitLocale =
    getHeader(event, 'x-locale') ||
    getHeader(event, 'x-user-locale') ||
    getHeader(event, 'x-language')

  if (explicitLocale) {
    const normalizedExplicit = normalizeFromRaw(explicitLocale)

    if (normalizedExplicit) {
      return normalizedExplicit
    }
  }

  const acceptLanguage = getHeader(event, 'accept-language')

  if (acceptLanguage) {
    for (const part of acceptLanguage.split(',')) {
      const normalized = normalizeFromRaw(part.split(';')[0] ?? '')

      if (normalized) {
        return normalized
      }
    }
  }

  return DEFAULT_SERVER_LOCALE
}

export const tServer = (
  event: H3Event | undefined,
  key: string,
  params: MessageParams = {}
) => {
  const locale = event ? resolveEventLocale(event) : DEFAULT_SERVER_LOCALE
  const template = getTemplate(locale, key) ?? getTemplate(DEFAULT_SERVER_LOCALE, key) ?? key
  return interpolate(template, params)
}

export const tServerField = (event: H3Event | undefined, fieldKey: string) => {
  const translated = tServer(event, `fields.${fieldKey}`)
  return translated === `fields.${fieldKey}` ? fieldKey : translated
}
