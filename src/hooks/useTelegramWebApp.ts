import { useEffect, useState, useCallback } from 'react'

interface TelegramWebApp {
  init: () => void
  ready: () => void
  close: () => void
  expand: () => void
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  onEvent: (event: string, callback: () => void) => void
  offEvent: (event: string, callback: () => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramWebAppState {
  isTelegram: boolean
  isReady: boolean
  isExpanded: boolean
  colorScheme: 'light' | 'dark'
  platform: string
  version: string
  themeParams: TelegramWebApp['themeParams']
  viewportHeight: number
}

export function useTelegramWebApp() {
  const [state, setState] = useState<TelegramWebAppState>({
    isTelegram: false,
    isReady: false,
    isExpanded: false,
    colorScheme: 'light',
    platform: 'unknown',
    version: '0',
    themeParams: {},
    viewportHeight: 0,
  })

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.init()
    tg.ready()
    tg.expand()

    setState({
      isTelegram: true,
      isReady: true,
      isExpanded: tg.isExpanded,
      colorScheme: tg.colorScheme,
      platform: tg.platform,
      version: tg.version,
      themeParams: tg.themeParams,
      viewportHeight: tg.viewportHeight,
    })
  }, [])

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.MainButton.setText(text)
    tg.MainButton.onClick(onClick)
    tg.MainButton.show()
  }, [])

  const hideMainButton = useCallback(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.MainButton.hide()
  }, [])

  const showBackButton = useCallback((onClick: () => void) => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.BackButton.onClick(onClick)
    tg.BackButton.show()
  }, [])

  const hideBackButton = useCallback(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.BackButton.hide()
  }, [])

  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'medium') => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    if (type === 'success') {
      tg.HapticFeedback.notificationOccurred('success')
    } else if (type === 'warning') {
      tg.HapticFeedback.notificationOccurred('warning')
    } else if (type === 'error') {
      tg.HapticFeedback.notificationOccurred('error')
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged()
    } else {
      tg.HapticFeedback.impactOccurred(type)
    }
  }, [])

  const close = useCallback(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.close()
  }, [])

  const setHeaderColor = useCallback((color: string) => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.headerColor = color
  }, [])

  const setBackgroundColor = useCallback((color: string) => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.backgroundColor = color
  }, [])

  return {
    ...state,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    haptic,
    close,
    setHeaderColor,
    setBackgroundColor,
  }
}