export const getKitengePatternDataUri = (strokeColor = '#111827') => {
  const color =
    typeof strokeColor === 'string' && strokeColor.trim()
      ? strokeColor.trim().startsWith('#')
        ? strokeColor.trim()
        : `#${strokeColor.trim()}`
      : '#111827'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <g stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
    <path d="M48 10L86 48L48 86L10 48Z"/>
    <path d="M48 28L68 48L48 68L28 48Z"/>
    <circle cx="48" cy="48" r="1.6" fill="${color}" stroke="none"/>
  </g>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
