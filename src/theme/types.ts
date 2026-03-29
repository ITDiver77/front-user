export type ThemeName = 'violet' | 'teal' | 'telegram' | 'light' | 'dark'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  name: ThemeName
  label: string
  description: string
}

export const availableThemes: ThemeConfig[] = [
  { name: 'violet', label: 'Violet', description: 'Soft purple, cute and modern' },
  { name: 'teal', label: 'Teal', description: 'Fresh and clean' },
  { name: 'telegram', label: 'Telegram', description: 'Matches your Telegram app theme' },
  { name: 'light', label: 'Classic Light', description: 'Traditional blue theme' },
]

export interface ThemeContextType {
  themeName: ThemeName
  setThemeName: (name: ThemeName) => void
  isDark: boolean
  isTelegram: boolean
  telegramThemeParams: TelegramThemeParams | null
}

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}