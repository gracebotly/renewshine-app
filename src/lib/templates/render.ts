/**
 * Replaces {{token}} placeholders with values from the tokens map.
 * Unknown tokens are left as-is in the output (rather than silently
 * deleted) so a typo in a saved template is visible instead of hidden.
 */
export function renderTemplate(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : match
  })
}
