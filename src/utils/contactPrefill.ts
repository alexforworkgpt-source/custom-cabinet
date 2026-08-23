const CONTACT_PARAM = 'contact';
const transientContacts = new Map<string, string>();

/** Reads the URL contact first, then the value remembered for this landing. */
export function readContactPrefill(storageKey: string): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(CONTACT_PARAM);
    if (fromUrl) return fromUrl;
  } catch {}

  const transient = transientContacts.get(storageKey);
  if (transient) {
    transientContacts.delete(storageKey);
    return transient;
  }

  try {
    return localStorage.getItem(storageKey) || '';
  } catch {}

  return '';
}

/**
 * Captures a quick-purchase contact before client analytics and API bootstrap.
 *
 * This cannot alter the initial document request, which already contained the
 * query value. Redaction of that request in proxy/access logs remains a
 * server-side responsibility.
 */
export function captureContactPrefillFromUrl(): void {
  let contact: string | null = null;

  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(CONTACT_PARAM)) return;
    contact = params.get(CONTACT_PARAM);
  } catch {
    return;
  }

  if (contact) {
    const storageKey = contactStorageKey(window.location.pathname);
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, contact);
      transientContacts.delete(storageKey);
    } catch {
      transientContacts.set(storageKey, contact);
    }
  } else if (!contactStorageKey(window.location.pathname)) {
    return;
  }

  // Privacy cleanup must still run when storage is blocked.
  stripContactFromUrl();
}

/** Removes only contact from the address bar, preserving other query and hash values. */
export function stripContactFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(CONTACT_PARAM)) return;

    params.delete(CONTACT_PARAM);
    const search = params.toString();
    const url = window.location.pathname + (search ? `?${search}` : '') + window.location.hash;
    window.history.replaceState(null, '', url);
  } catch {}
}

function contactStorageKey(pathname: string): string | null {
  const match = pathname.match(/(?:^|\/)buy\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    const slug = decodeURIComponent(match[1]);
    return slug ? `lp_contact_${slug}` : null;
  } catch {
    return null;
  }
}
