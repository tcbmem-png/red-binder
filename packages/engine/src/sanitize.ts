// PII sanitization for user input (per docs/ARCHITECTURE.md §3 and the token contract).
//
// User input is rendered as LITERAL text:
//  - Control characters and HTML tags are stripped.
//  - Tab / newline / carriage return collapse to a single space (values are single-line).
//  - Tokens inside a value are never re-interpreted — substitution is single-pass, and
//    values fill pre-parsed inline runs, so a value of "{{x}}" stays the literal text
//    "{{x}}" and markdown markers in a value never alter document structure.

const HTML_TAG = /<[^>]*>/g;
const WHITESPACE_RUNS = /[\r\n\t]+/g;

// Drop C0 control characters (0x00–0x1F) and DEL (0x7F), but keep tab/newline/CR so the
// whitespace step can normalize them to a space. Done by char code to avoid putting literal
// control characters in source.
function stripControlChars(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) {
      out += s[i];
    } else if (code < 0x20 || code === 0x7f) {
      // drop
    } else {
      out += s[i];
    }
  }
  return out;
}

export function sanitizeValue(input: unknown): string {
  if (input === null || input === undefined) return '';
  const raw = typeof input === 'string' ? input : String(input);
  return stripControlChars(raw.replace(HTML_TAG, '')).replace(WHITESPACE_RUNS, ' ').trim();
}
