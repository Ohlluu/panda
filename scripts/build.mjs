import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const f of [
  'index.html',
  'styles.css',
  'sunny.css',
  'app.js',
  'scheduling.js',
  'newsletters.js',
])
  await copyFile(f, `dist/${f}`);
await cp('assets', 'dist/assets', { recursive: true });
console.log('Static website built in dist/');
