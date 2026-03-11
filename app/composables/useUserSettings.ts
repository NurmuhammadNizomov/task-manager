export type AppLanguage = 'en' | 'ru' | 'uz'
export type AppTheme = 'light' | 'dark' | 'system'

export const DEFAULT_LANGUAGE: AppLanguage = 'en'
export const DEFAULT_THEME: AppTheme = 'light'

export const useUserSettings = () => {
  const { t } = useI18n()

  const languageItems = computed(() => [
    { label: 'English', value: 'en' as AppLanguage },
    { label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', value: 'ru' as AppLanguage },
    { label: "O'zbek", value: 'uz' as AppLanguage }
  ])

  const themeItems = computed(() => [
    { label: t('theme.system'), value: 'system' as AppTheme, icon: 'lucide:monitor' },
    { label: t('theme.light'), value: 'light' as AppTheme, icon: 'lucide:sun' },
    { label: t('theme.dark'), value: 'dark' as AppTheme, icon: 'lucide:moon' }
  ])

  return {
    languageItems,
    themeItems
  }
}
