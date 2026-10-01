/** Only same-site relative paths may be used as a post-login redirect target.
 *  Anything else (absolute URLs, protocol-relative "//evil.com", backslash tricks) falls back to "/". */
export function safeNext(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  if ([...value].some((ch) => ch.charCodeAt(0) < 0x20)) return fallback
  return value
}
