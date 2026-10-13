// dist/index.html (vite-plugin-singlefile) -> release/한끼콕.html
import { copyFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
const src = 'dist/index.html', dst = 'release/한끼콕.html';
if (!existsSync(src)) { console.error(`${src} 가 없어요. 먼저 npm run build 를 실행하세요.`); process.exit(1); }
mkdirSync('release', { recursive: true });
copyFileSync(src, dst);
const b = statSync(dst).size;
console.log(`${dst}  ${b.toLocaleString()} bytes (${(b / 1024).toFixed(1)} KB)`);
