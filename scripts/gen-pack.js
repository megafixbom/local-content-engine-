import fs from 'node:fs';

const profile = {
  kind: 'teacher',
  name: 'Tiny Riffs Guitar',
  subject: 'Guitar',
  students: 'Young kids, beginners',
  style: 'Patient, fun, encouraging',
  location: 'Mumbai: based in Malad, teaches across Mumbai'
};

const tasks = [
  ['setup', 'channel-setup-pack'],
  ['short', 'shorts-scripts'],
  ['lesson', 'lesson-video-script'],
  ['parents', 'parent-pitch-videos'],
  ['songs', 'original-song-ideas'],
  ['calendar', '2-week-content-calendar']
];

const outDir = '/workspace/content/tiny-riffs';
fs.mkdirSync(outDir, { recursive: true });

for (const [type, name] of tasks) {
  process.stdout.write(`Generating ${type}... `);
  try {
    const res = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, request: { type } })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const safe = name.replace(/[^a-z0-9-]/gi, '_');
    fs.writeFileSync(`${outDir}/${safe}.md`, data.content.trim() + '\n');
    console.log('saved', safe + '.md');
  } catch (err) {
    console.log('FAILED:', err.message);
  }
}

console.log('Done.');
