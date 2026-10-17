import { Greeting } from '../types/greeting';

/**
 * Base64URL encoder/decoder supporting full UTF-8 Unicode characters (emojis, regional scripts)
 */
export function encodeGreetingToHash(greeting: Greeting): string {
  try {
    const jsonStr = JSON.stringify(greeting);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // Convert base64 to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode greeting:', err);
    return '';
  }
}

export function decodeGreetingFromHash(rawInput: string): Greeting | null {
  try {
    let clean = rawInput.trim();
    if (clean.startsWith('#g=')) clean = clean.substring(3);
    else if (clean.startsWith('?g=')) clean = clean.substring(3);
    else if (clean.startsWith('#gId=')) clean = clean.substring(5);
    else if (clean.startsWith('?gId=')) clean = clean.substring(5);

    // Decode URL encoding if present
    try {
      clean = decodeURIComponent(clean);
    } catch {
      // already decoded
    }

    // Convert base64url back to standard base64
    let base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return parsed as Greeting;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode greeting from hash:', err);
    return null;
  }
}

/**
 * Build share links for inline (?g=... or #g=...) or saved (/g/:id)
 * Notice: We prioritize /g/:id or ?g= because messengers like WhatsApp, SMS, and Instagram
 * reliably preserve paths and query params, whereas they frequently strip `#` hashes.
 */
export function getGreetingShareUrl(greeting: Greeting, useSavedId = true): string {
  const origin = window.location.origin;
  // If greeting has an ID, always provide a clean, short, workable link (e.g. https://domain/?id=xyz123)
  if (useSavedId && greeting.id) {
    return `${origin}/?id=${encodeURIComponent(greeting.id)}`;
  }
  const hash = encodeGreetingToHash(greeting);
  return `${origin}/?g=${hash}`;
}

export function getWhatsAppShareUrl(greeting: Greeting, url: string): string {
  const name = greeting.recipient?.name ? greeting.recipient.name : 'you';
  const text = `🎉 I made a special interactive birthday greeting for ${name}! Open it here:\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
