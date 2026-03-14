const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'images');
const W = 1920;
const H = 1080;

const C = {
  purple: '#5b27b8',
  deep: '#3d1a7a',
  gold: '#c7951e',
  goldLight: '#e8b84b',
  white: '#ffffff',
  off: '#f7f4fc',
  ink: '#1f1340',
  muted: '#6d5a99',
  green: '#2fbf71',
  blue: '#3d8bfd',
  orange: '#f08a24'
};

function ensureDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgWrap(content, defs = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${defs}\n${content}\n</svg>\n`;
}

function base(accent = C.purple) {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fcfbff"/>
      <stop offset="100%" stop-color="#efe9fb"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="12%" r="40%">
      <stop offset="0%" stop-color="rgba(91,39,184,0.18)"/>
      <stop offset="100%" stop-color="rgba(91,39,184,0)"/>
    </radialGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#351c6d" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="8" fill="${accent}"/>
  <circle cx="1560" cy="130" r="420" fill="url(#glow)"/>
  `;
}

function card(x, y, w, h, tone, title, lines) {
  const lineEls = lines
    .map((l, idx) => `<text x="${x + 34}" y="${y + 110 + idx * 38}" font-size="26" fill="${C.muted}" font-weight="500">• ${esc(l)}</text>`)
    .join('\n');

  return `
  <g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${C.white}"/>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="7" rx="7" fill="${tone}"/>
  <text x="${x + 30}" y="${y + 62}" font-size="42" fill="${C.ink}" font-weight="700">${esc(title)}</text>
  ${lineEls}
  `;
}

function write(name, content) {
  fs.writeFileSync(path.join(OUT_DIR, name), svgWrap(content));
}

function toolkitLaptop(x, y, w, h) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#2a2354"/>
  <rect x="${x + 18}" y="${y + 18}" width="${w - 36}" height="${h - 62}" rx="10" fill="#f4efff"/>
  <rect x="${x + 40}" y="${y + 52}" width="${w - 80}" height="12" fill="${C.blue}"/>
  <rect x="${x + 40}" y="${y + 88}" width="${w - 220}" height="12" fill="${C.green}"/>
  <rect x="${x + 40}" y="${y + 124}" width="${w - 320}" height="12" fill="${C.orange}"/>
  <rect x="${x - 20}" y="${y + h - 16}" width="${w + 40}" height="24" rx="10" fill="#3a2e73"/>
  `;
}

function books(x, y) {
  const set = [
    { c: '#6841bf', w: 260, t: 'PMBOK guide' },
    { c: '#2d7de0', w: 230, t: 'Agile practice' },
    { c: '#2aa86f', w: 200, t: 'ECO blueprint' }
  ];
  return set
    .map(
      (b, idx) => `
      <rect x="${x}" y="${y + idx * 52}" width="${b.w}" height="42" rx="8" fill="${b.c}"/>
      <text x="${x + 16}" y="${y + idx * 52 + 28}" font-size="20" fill="white" font-weight="600">${esc(b.t)}</text>
    `
    )
    .join('\n');
}

function generate() {
  ensureDir();

  write(
    'day2-image-01-cover.svg',
    `
    ${base(C.gold)}
    ${card(90, 92, 860, 620, C.gold, 'your pmp exam toolkit', ['core resources', 'eco blueprint', 'day 2 learning system'])}
    ${toolkitLaptop(1030, 190, 740, 430)}
    ${books(1080, 680)}
    <circle cx="1680" cy="120" r="54" fill="${C.purple}"/>
    <text x="1680" y="128" text-anchor="middle" font-size="20" font-weight="700" fill="white">PMP</text>
    `
  );

  write(
    'day2-image-02-toolkit-collage.svg',
    `
    ${base(C.purple)}
    ${card(90, 88, 540, 420, C.purple, 'pmbok guide', ['principles', 'performance domains'])}
    ${card(670, 88, 540, 420, C.blue, 'agile guide', ['agile + hybrid', 'iterative delivery'])}
    ${card(1250, 88, 580, 420, C.green, 'eco', ['domains', 'tasks', 'enablers'])}
    ${card(160, 550, 1600, 420, C.gold, 'process groups context', ['initiating', 'planning', 'executing', 'monitoring and controlling', 'closing'])}
    `
  );

  write(
    'day2-image-03-pmbok.svg',
    `
    ${base(C.blue)}
    ${card(120, 120, 760, 820, C.blue, 'pmbok guide (7th)', ['principles-centric', 'value delivery', 'tailoring and systems thinking'])}
    <g filter="url(#softShadow)">
      <rect x="980" y="170" width="760" height="740" rx="28" fill="#2d7de0"/>
    </g>
    <text x="1110" y="370" font-size="88" fill="white" font-weight="700">PMBOK</text>
    <text x="1110" y="440" font-size="44" fill="white" font-weight="600">guide</text>
    <text x="1110" y="508" font-size="34" fill="white" font-weight="500">7th edition</text>
    `
  );

  write(
    'day2-image-04-agile.svg',
    `
    ${base(C.green)}
    ${card(110, 120, 820, 820, C.green, 'agile practice guide', ['scrum / kanban', 'adaptive planning', 'continuous feedback'])}
    <g filter="url(#softShadow)"><rect x="980" y="150" width="820" height="780" rx="24" fill="white"/></g>
    <rect x="1006" y="176" width="768" height="58" rx="14" fill="#26a36a"/>
    <text x="1028" y="214" font-size="26" fill="white" font-weight="700">sprint board</text>

    <rect x="1012" y="260" width="244" height="620" rx="14" fill="#f4f7fb"/>
    <rect x="1270" y="260" width="244" height="620" rx="14" fill="#f4f7fb"/>
    <rect x="1528" y="260" width="244" height="620" rx="14" fill="#f4f7fb"/>

    <text x="1030" y="304" font-size="22" fill="${C.ink}" font-weight="600">to do</text>
    <text x="1288" y="304" font-size="22" fill="${C.ink}" font-weight="600">in progress</text>
    <text x="1546" y="304" font-size="22" fill="${C.ink}" font-weight="600">done</text>

    <rect x="1030" y="330" width="208" height="74" rx="10" fill="#5b27b8"/><text x="1060" y="375" font-size="17" fill="white" font-weight="600">story 1</text>
    <rect x="1030" y="432" width="208" height="74" rx="10" fill="#3d8bfd"/><text x="1060" y="477" font-size="17" fill="white" font-weight="600">story 2</text>
    <rect x="1030" y="534" width="208" height="74" rx="10" fill="#2fbf71"/><text x="1060" y="579" font-size="17" fill="white" font-weight="600">story 3</text>
    <rect x="1030" y="636" width="208" height="74" rx="10" fill="#f08a24"/><text x="1060" y="681" font-size="17" fill="white" font-weight="600">story 4</text>

    <rect x="1288" y="330" width="208" height="74" rx="10" fill="#3d8bfd"/><text x="1318" y="375" font-size="17" fill="white" font-weight="600">story 1</text>
    <rect x="1288" y="432" width="208" height="74" rx="10" fill="#2fbf71"/><text x="1318" y="477" font-size="17" fill="white" font-weight="600">story 2</text>
    <rect x="1288" y="534" width="208" height="74" rx="10" fill="#f08a24"/><text x="1318" y="579" font-size="17" fill="white" font-weight="600">story 3</text>

    <rect x="1546" y="330" width="208" height="74" rx="10" fill="#2fbf71"/><text x="1576" y="375" font-size="17" fill="white" font-weight="600">story 1</text>
    <rect x="1546" y="432" width="208" height="74" rx="10" fill="#f08a24"/><text x="1576" y="477" font-size="17" fill="white" font-weight="600">story 2</text>
    `
  );

  write(
    'day2-image-05-process-groups.svg',
    `
    ${base(C.gold)}
    <g filter="url(#softShadow)"><rect x="120" y="130" width="1680" height="820" rx="30" fill="white"/></g>
    <text x="170" y="230" font-size="56" fill="${C.ink}" font-weight="700">process groups flow</text>

    <circle cx="960" cy="560" r="280" fill="none" stroke="rgba(61,26,122,0.35)" stroke-width="8"/>

    <circle cx="960" cy="280" r="88" fill="#2fbf71"/><text x="960" y="290" text-anchor="middle" font-size="22" fill="white" font-weight="700">initiating</text>
    <circle cx="1226" cy="472" r="88" fill="#3d8bfd"/><text x="1226" y="482" text-anchor="middle" font-size="22" fill="white" font-weight="700">planning</text>
    <circle cx="1124" cy="782" r="88" fill="#5b27b8"/><text x="1124" y="792" text-anchor="middle" font-size="22" fill="white" font-weight="700">executing</text>
    <circle cx="796" cy="782" r="88" fill="#f08a24"/><text x="796" y="775" text-anchor="middle" font-size="18" fill="white" font-weight="700">monitoring</text><text x="796" y="800" text-anchor="middle" font-size="18" fill="white" font-weight="700">and controlling</text>
    <circle cx="694" cy="472" r="88" fill="#a365f5"/><text x="694" y="482" text-anchor="middle" font-size="22" fill="white" font-weight="700">closing</text>
    `
  );

  write(
    'day2-image-06-exam-focus.svg',
    `
    ${base(C.deep)}
    ${card(110, 120, 820, 820, C.deep, 'exam format snapshot', ['180 questions', '230 minutes', '2 breaks', '5 question types'])}
    <g filter="url(#softShadow)"><rect x="980" y="140" width="820" height="800" rx="26" fill="white"/></g>
    <text x="1040" y="226" font-size="44" fill="${C.ink}" font-weight="700">eco-first course focus</text>

    <text x="1040" y="308" font-size="28" fill="${C.ink}" font-weight="600">ECO alignment</text>
    <rect x="1040" y="320" width="700" height="42" rx="14" fill="#ece8f8"/>
    <rect x="1040" y="320" width="700" height="42" rx="14" fill="#5b27b8"/>

    <text x="1040" y="438" font-size="28" fill="${C.ink}" font-weight="600">PMBOK depth</text>
    <rect x="1040" y="450" width="700" height="42" rx="14" fill="#ece8f8"/>
    <rect x="1040" y="450" width="504" height="42" rx="14" fill="#3d8bfd"/>

    <text x="1040" y="568" font-size="28" fill="${C.ink}" font-weight="600">Agile depth</text>
    <rect x="1040" y="580" width="700" height="42" rx="14" fill="#ece8f8"/>
    <rect x="1040" y="580" width="476" height="42" rx="14" fill="#2fbf71"/>

    <text x="1040" y="698" font-size="28" fill="${C.ink}" font-weight="600">Process context</text>
    <rect x="1040" y="710" width="700" height="42" rx="14" fill="#ece8f8"/>
    <rect x="1040" y="710" width="434" height="42" rx="14" fill="#f08a24"/>
    `
  );

  write(
    'day2-image-07-eco-structure.svg',
    `
    ${base(C.purple)}
    <g filter="url(#softShadow)"><rect x="90" y="100" width="1740" height="860" rx="28" fill="white"/></g>
    <text x="160" y="196" font-size="52" fill="${C.ink}" font-weight="700">eco hierarchy</text>
    ${card(170, 280, 520, 540, C.purple, 'domain', ['people', 'process', 'business environment'])}
    ${card(750, 280, 480, 540, C.blue, 'task', ['what PM does', 'outcome expectations'])}
    ${card(1290, 280, 460, 540, C.green, 'enabler', ['examples of work', 'observable actions'])}
    <line x1="700" y1="540" x2="740" y2="540" stroke="rgba(91,39,184,0.45)" stroke-width="8"/>
    <line x1="1240" y1="540" x2="1280" y2="540" stroke="rgba(91,39,184,0.45)" stroke-width="8"/>
    `
  );

  write(
    'day2-image-08-domain-weighting.svg',
    `
    ${base(C.gold)}
    <g filter="url(#softShadow)"><rect x="100" y="100" width="1720" height="860" rx="28" fill="white"/></g>
    <text x="160" y="188" font-size="52" fill="${C.ink}" font-weight="700">domain weighting</text>

    <path d="M720,560 L720,290 A270,270 0 0,1 951.8,697.8 Z" fill="#2fbf71"/>
    <path d="M720,560 L951.8,697.8 A270,270 0 1,1 720,290 Z" fill="#3d8bfd"/>
    <path d="M720,560 L720,290 A270,270 0 0,1 720,290 Z" fill="#f08a24" opacity="0.01"/>
    <path d="M720,560 L720,290 A270,270 0 0,1 856.2,326.9 Z" fill="#f08a24"/>
    <circle cx="720" cy="560" r="130" fill="white"/>

    <rect x="1160" y="390" width="520" height="86" rx="14" fill="#2fbf71"/><text x="1184" y="445" font-size="36" fill="white" font-weight="700">people 42%</text>
    <rect x="1160" y="550" width="520" height="86" rx="14" fill="#3d8bfd"/><text x="1184" y="605" font-size="36" fill="white" font-weight="700">process 50%</text>
    <rect x="1160" y="710" width="520" height="86" rx="14" fill="#f08a24"/><text x="1184" y="765" font-size="36" fill="white" font-weight="700">business env 8%</text>
    `
  );

  write(
    'day2-image-09-eco-activity.svg',
    `
    ${base(C.blue)}
    <g filter="url(#softShadow)"><rect x="90" y="90" width="1740" height="900" rx="28" fill="white"/></g>
    ${card(140, 170, 720, 740, C.blue, 'activity: navigate ECO', ['locate 3 domains', 'trace 1 task', 'map enablers', 'record questions'])}
    ${toolkitLaptop(930, 250, 780, 520)}
    <g filter="url(#softShadow)"><rect x="980" y="820" width="680" height="120" rx="18" fill="white"/></g>
    <text x="1015" y="890" font-size="30" fill="${C.ink}" font-weight="700">output: your notes + top 3 questions</text>
    `
  );

  write(
    'day2-image-10-next-steps.svg',
    `
    ${base(C.green)}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8e1fb"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#351c6d" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <path d="M0,1080 L730,520 L1190,520 L1920,1080 Z" fill="rgba(91,39,184,0.12)"/>
    <path d="M260,1050 C520,830 800,690 960,540 C1120,390 1350,330 1670,260" fill="none" stroke="${C.gold}" stroke-width="18"/>
    <g filter="url(#softShadow)"><rect x="1180" y="170" width="590" height="310" rx="24" fill="white"/></g>
    <text x="1240" y="270" font-size="52" fill="${C.ink}" font-weight="700">day 3</text>
    <text x="1240" y="328" font-size="34" fill="${C.muted}" font-weight="600">mindset deep dive</text>
    <text x="1240" y="378" font-size="34" fill="${C.muted}" font-weight="600">people domain focus</text>
    `
  );

  console.log(`Generated Day 2 SVG images in ${OUT_DIR}`);
}

generate();
