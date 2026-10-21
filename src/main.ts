import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/hind-siliguri/bengali-400.css';
import '@fontsource/hind-siliguri/bengali-500.css';
import '@fontsource/hind-siliguri/bengali-600.css';
import '@fontsource/hind-siliguri/bengali-700.css';
import './styles.css';
import { CREDITS } from './credits';
import { Game } from './game/Game';
import { setLang, t } from './i18n/i18n';
import { takeIncomingCode } from './pwa/handoff';
import { SaveSystem } from './systems/save';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const save = SaveSystem.fromBrowser();

// Progress handed over from the game's old address (see pwa/handoff.ts). A fresh device takes it
// as is; a device that already has progress asks first.
const incoming = takeIncomingCode();
if (incoming) {
  const d = save.get();
  const fresh = d.gamesPlayed === 0 && d.points === 0 && d.bestScore === 0;
  setLang(d.settings.lang);
  if (fresh || window.confirm(t('handoff.confirm'))) save.importCode(incoming);
}

new Game(canvas, save);
console.info(`${CREDITS.game} — ${CREDITS.line}`);
