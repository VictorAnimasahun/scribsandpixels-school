/** True inside the Android app (Capacitor), false on the website. */
export const isNativeApp = (): boolean =>
  (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() === true
