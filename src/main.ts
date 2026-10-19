import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './styles.css';
import { CREDITS } from './credits';
import { Game } from './game/Game';
import { SaveSystem } from './systems/save';

const canvas = document.getElementById('game') as HTMLCanvasElement;
new Game(canvas, SaveSystem.fromBrowser());
console.info(`${CREDITS.game} — ${CREDITS.line}`);
