/**
 * Moving players from the game's old address to its home at https://nabeeha.mansoor.info.
 *
 * Browser storage belongs to one site, so progress saved at nafeesmansoor.github.io doesn't exist
 * at the new domain. The old address hands it over: once the new home is serving the game, the
 * game running at the old address passes the player's progress code to the new home in the URL
 * fragment (never sent to any server), and the new home imports it. Installed home-screen copies
 * can't leave their own site in full-screen mode, so they show the code and the steps instead.
 */

export const HOME_ORIGIN = 'https://nabeeha.mansoor.info';

/** Addresses the game used to live at, whose players should be moved home. */
const OLD_HOSTS = ['nafeesmansoor.github.io'];

export const isOldHome = (): boolean => OLD_HOSTS.includes(location.hostname);

/** At the old address: is the new home already serving NibbleNaut? */
export async function newHomeReady(): Promise<boolean> {
  try {
    const res = await fetch(`${HOME_ORIGIN}/manifest.webmanifest`, { cache: 'no-store' });
    if (!res.ok) return false;
    const manifest = (await res.json()) as { name?: string };
    return manifest.name === 'NibbleNaut';
  } catch {
    return false;
  }
}

/** The new home's address carrying a progress code. */
export const handoffUrl = (code: string): string => `${HOME_ORIGIN}/#progress=${encodeURIComponent(code)}`;

/** At the new home: a progress code handed over in the URL, removed from the address bar. */
export function takeIncomingCode(): string | null {
  const match = location.hash.match(/(?:^#|&)progress=([^&]+)/);
  if (!match) return null;
  history.replaceState(null, '', location.pathname + location.search);
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
