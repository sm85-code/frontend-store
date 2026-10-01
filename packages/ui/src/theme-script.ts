export const THEME_KEY = 'store-theme'

/** Blocking script body for <head> so the first paint already has the right theme (no flash).
 *  Lives outside the 'use client' theme toggle so server components can import the string. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`
