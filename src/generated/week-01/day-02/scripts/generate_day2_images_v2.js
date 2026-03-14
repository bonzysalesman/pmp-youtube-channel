const fs = require('fs');
const path = require('path');

const W = 1920;
const H = 1080;

const outA = path.resolve(__dirname, '../../../..', 'assets', 'Day_2', 'canonical');
const outB = path.resolve(__dirname, '..', 'images');

const C = {
  bg1: '#140a3c',
  bg2: '#2a1369',
  bg3: '#4a1fa3',
  purple: '#6c35d4',
  purpleDeep: '#3e1b85',
  violetSoft: '#8f6ce0',
  gold: '#d8a729',
  goldSoft: '#efc861',
  white: '#ffffff',
  card: '#f8f7fd',
  ink: '#1d1142',
  muted: '#6c5a9f',
  green: '#2fbf71',
  blue: '#3d8bfd',
  orange: '#ef8a23',
};

function ensure() {
  fs.mkdirSync(outA, { recursive: true });
  fs.mkdirSync(outB, { recursive: true });
}

function wrap(svgInner, defsExtra = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgDark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.bg1}"/>
      <stop offset="56%" stop-color="${C.bg2}"/>
      <stop offset="100%" stop-color="${C.bg3}"/>
    </linearGradient>
    <linearGradient id="bgLight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fcfbff"/>
      <stop offset="100%" stop-color="#efe9fb"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.goldSoft}"/>
      <stop offset="100%" stop-color="${C.gold}"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="170%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#120733" flood-opacity="0.25"/>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
    ${defsExtra}
  </defs>
  ${svgInner}
</svg>
`;
}

function quietLeftDarkBase() {
  return `
  <rect width="${W}" height="${H}" fill="url(#bgDark)"/>
  <circle cx="1480" cy="180" r="320" fill="#7d57e4" opacity="0.22" filter="url(#softGlow)"/>
  <circle cx="1620" cy="850" r="420" fill="#5f33c8" opacity="0.16" filter="url(#softGlow)"/>
  <rect x="0" y="0" width="860" height="${H}" fill="#160b41" opacity="0.30"/>
  `;
}

function card(x, y, w, h, title = '', tone = C.purple) {
  const t = title ? `<text x="${x + 28}" y="${y + 56}" font-size="34" fill="${C.ink}" font-weight="700">${title}</text>` : '';
  return `
  <g filter="url(#cardShadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${C.white}"/>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="6" rx="6" fill="${tone}"/>
  ${t}
  `;
}

function labelTag(x, y, w, text, color) {
  return `<rect x="${x}" y="${y}" width="${w}" height="34" rx="10" fill="${color}"/><text x="${x + 12}" y="${y + 23}" font-size="18" fill="white" font-weight="700">${text}</text>`;
}

function laptop(x, y, w, h, withBars = true) {
  const bars = withBars
    ? `
      <rect x="${x + 34}" y="${y + 38}" width="${w - 68}" height="10" fill="${C.blue}"/>
      <rect x="${x + 34}" y="${y + 74}" width="${w - 160}" height="10" fill="${C.green}"/>
      <rect x="${x + 34}" y="${y + 110}" width="${w - 248}" height="10" fill="${C.gold}"/>
      <rect x="${x + 34}" y="${y + 146}" width="${w - 86}" height="10" fill="${C.purple}"/>
    `
    : '';

  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#2f1a72"/>
  <rect x="${x + 18}" y="${y + 16}" width="${w - 36}" height="${h - 56}" rx="10" fill="#f4f0ff"/>
  ${bars}
  <rect x="${x - 18}" y="${y + h - 18}" width="${w + 36}" height="24" rx="10" fill="#3e2689"/>
  `;
}

function save(name, inner, defs = '') {
  const svg = wrap(inner, defs);
  fs.writeFileSync(path.join(outA, name), svg);
  fs.writeFileSync(path.join(outB, name), svg);
}

function generate() {
  ensure();

  // 01 cover
  save('day2-image-01-cover.svg', `
    ${quietLeftDarkBase()}
    <rect x="1020" y="220" width="740" height="560" rx="26" fill="#ffffff" opacity="0.06"/>
    ${laptop(1020, 330, 700, 360, true)}
    <rect x="1060" y="232" width="120" height="210" rx="10" fill="#5b31bf"/>
    <rect x="1188" y="232" width="120" height="210" rx="10" fill="#d8a729"/>
    <rect x="1320" y="252" width="100" height="190" rx="10" fill="#6d40cf"/>
    <circle cx="1540" cy="240" r="58" fill="#6b3ed0"/>
  `);

  // 02 toolkit collage
  save('day2-image-02-toolkit-collage.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(120, 120, 520, 370, 'PMBOK Guide', C.purple)}
    ${card(700, 120, 520, 370, 'Agile Practice Guide', C.gold)}
    ${card(1280, 120, 520, 370, 'ECO Blueprint', C.green)}
    ${card(280, 540, 1360, 420, 'Process Group Context', C.blue)}

    ${labelTag(170, 190, 170, 'principles', C.purple)}
    ${labelTag(170, 234, 230, 'value delivery', C.blue)}
    ${labelTag(750, 190, 160, 'to do', C.blue)}
    ${labelTag(922, 190, 200, 'in progress', C.orange)}
    ${labelTag(1134, 190, 120, 'done', C.green)}
    ${labelTag(1330, 190, 150, 'domains', C.green)}
    ${labelTag(1488, 190, 110, 'tasks', C.purple)}
    ${labelTag(1606, 190, 140, 'enablers', C.orange)}

    <circle cx="960" cy="755" r="140" fill="none" stroke="#6d5a9f" stroke-width="14"/>
    <path d="M960,615 L1024,649" stroke="#6d5a9f" stroke-width="12"/>
    <path d="M1088,755 L1024,819" stroke="#6d5a9f" stroke-width="12"/>
    <path d="M960,895 L896,831" stroke="#6d5a9f" stroke-width="12"/>
    <path d="M832,755 L896,691" stroke="#6d5a9f" stroke-width="12"/>
  `);

  // 03 PMBOK focus
  save('day2-image-03-pmbok.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(170, 120, 720, 840, '', C.blue)}
    <rect x="330" y="220" width="390" height="560" rx="20" fill="#3d8bfd"/>
    <rect x="330" y="220" width="50" height="560" rx="10" fill="#2e6bc8"/>
    <circle cx="525" cy="340" r="95" fill="#ffffff" opacity="0.18"/>
    ${labelTag(1020, 210, 360, '12 principles', C.purple)}
    ${labelTag(1020, 270, 440, 'value delivery orientation', C.blue)}
    ${labelTag(1020, 330, 320, 'tailoring mindset', C.gold)}
    <rect x="1020" y="390" width="730" height="8" fill="#ded8ef"/>
    <rect x="1020" y="430" width="660" height="8" fill="#ded8ef"/>
    <rect x="1020" y="470" width="700" height="8" fill="#ded8ef"/>
    <rect x="1020" y="510" width="620" height="8" fill="#ded8ef"/>
    <rect x="1020" y="550" width="680" height="8" fill="#ded8ef"/>
  `);

  // 04 agile
  save('day2-image-04-agile.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(140, 110, 1640, 860, '', C.green)}
    <rect x="230" y="220" width="440" height="620" rx="16" fill="#f2f6ff"/>
    <rect x="740" y="220" width="440" height="620" rx="16" fill="#f2f6ff"/>
    <rect x="1250" y="220" width="440" height="620" rx="16" fill="#f2f6ff"/>

    ${labelTag(250, 170, 140, 'to do', C.blue)}
    ${labelTag(760, 170, 190, 'in progress', C.orange)}
    ${labelTag(1270, 170, 120, 'done', C.green)}

    <rect x="262" y="270" width="370" height="78" rx="10" fill="#5b35cf"/>
    <rect x="262" y="370" width="370" height="78" rx="10" fill="#3d8bfd"/>
    <rect x="262" y="470" width="370" height="78" rx="10" fill="#ef8a23"/>
    <rect x="262" y="570" width="370" height="78" rx="10" fill="#7e4df1"/>

    <rect x="772" y="310" width="370" height="78" rx="10" fill="#3d8bfd"/>
    <rect x="772" y="410" width="370" height="78" rx="10" fill="#ef8a23"/>
    <rect x="772" y="510" width="370" height="78" rx="10" fill="#5b35cf"/>

    <rect x="1282" y="350" width="370" height="78" rx="10" fill="#2fbf71"/>
    <rect x="1282" y="450" width="370" height="78" rx="10" fill="#3d8bfd"/>

    <path d="M640,410 C700,410 720,400 744,360" stroke="#6c5a9f" stroke-width="8" fill="none"/>
    <path d="M1150,450 C1210,450 1230,440 1250,410" stroke="#6c5a9f" stroke-width="8" fill="none"/>
  `);

  // 05 process groups flow
  save('day2-image-05-process-groups.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(170, 90, 1580, 900, '', C.gold)}

    <circle cx="960" cy="560" r="290" fill="none" stroke="#b7aacd" stroke-width="14"/>

    <circle cx="960" cy="270" r="92" fill="#2fbf71"/>
    <circle cx="1238" cy="470" r="92" fill="#3d8bfd"/>
    <circle cx="1132" cy="804" r="92" fill="#5b35cf"/>
    <circle cx="788" cy="804" r="92" fill="#ef8a23"/>
    <circle cx="682" cy="470" r="92" fill="#8a62e2"/>

    <path d="M1000,345 L1168,425" stroke="#b7aacd" stroke-width="8"/>
    <path d="M1200,552 L1148,716" stroke="#b7aacd" stroke-width="8"/>
    <path d="M1042,848 L878,848" stroke="#b7aacd" stroke-width="8"/>
    <path d="M772,716 L720,552" stroke="#b7aacd" stroke-width="8"/>
    <path d="M752,426 L920,344" stroke="#b7aacd" stroke-width="8"/>
  `);

  // 06 exam focus dashboard
  save('day2-image-06-exam-focus.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(120, 100, 860, 880, '', C.purpleDeep)}
    ${card(1020, 100, 780, 880, '', C.gold)}

    ${labelTag(190, 180, 260, '180 questions', C.purple)}
    ${labelTag(190, 230, 250, '230 minutes', C.blue)}
    ${labelTag(190, 280, 220, '2 breaks', C.green)}
    ${labelTag(190, 330, 340, '5 question formats', C.orange)}

    <rect x="190" y="410" width="720" height="18" rx="9" fill="#ece8f7"/>
    <rect x="190" y="410" width="720" height="18" rx="9" fill="#5b35cf"/>
    <rect x="190" y="470" width="720" height="18" rx="9" fill="#ece8f7"/>
    <rect x="190" y="470" width="520" height="18" rx="9" fill="#3d8bfd"/>
    <rect x="190" y="530" width="720" height="18" rx="9" fill="#ece8f7"/>
    <rect x="190" y="530" width="480" height="18" rx="9" fill="#2fbf71"/>

    <circle cx="1410" cy="520" r="250" fill="none" stroke="#d8cfec" stroke-width="42"/>
    <path d="M1410,270 A250,250 0 0,1 1630,630" fill="none" stroke="#3d8bfd" stroke-width="42"/>
    <path d="M1630,630 A250,250 0 0,1 1170,660" fill="none" stroke="#2fbf71" stroke-width="42"/>
    <path d="M1170,660 A250,250 0 0,1 1410,270" fill="none" stroke="#ef8a23" stroke-width="42"/>
  `);

  // 07 ECO hierarchy
  save('day2-image-07-eco-structure.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(120, 120, 530, 820, '', C.purple)}
    ${card(695, 120, 530, 820, '', C.blue)}
    ${card(1270, 120, 530, 820, '', C.green)}

    <rect x="210" y="260" width="350" height="120" rx="16" fill="#6c35d4"/>
    <rect x="210" y="460" width="350" height="120" rx="16" fill="#8a62e2"/>
    <rect x="210" y="660" width="350" height="120" rx="16" fill="#5b35cf"/>

    <rect x="785" y="290" width="350" height="160" rx="16" fill="#3d8bfd"/>
    <rect x="785" y="540" width="350" height="160" rx="16" fill="#5da1ff"/>

    <rect x="1360" y="260" width="350" height="120" rx="16" fill="#2fbf71"/>
    <rect x="1360" y="460" width="350" height="120" rx="16" fill="#58d38e"/>
    <rect x="1360" y="660" width="350" height="120" rx="16" fill="#24a866"/>

    <line x1="560" y1="520" x2="785" y2="520" stroke="#bfb3d7" stroke-width="10"/>
    <line x1="1135" y1="520" x2="1360" y2="520" stroke="#bfb3d7" stroke-width="10"/>
  `);

  // 08 domain weighting
  save('day2-image-08-domain-weighting.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgLight)"/>
    ${card(100, 90, 1720, 900, '', C.gold)}

    <path d="M690,550 L690,250 A300,300 0 0,1 987,596 Z" fill="#2fbf71"/>
    <path d="M690,550 L987,596 A300,300 0 1,1 690,250 Z" fill="#3d8bfd"/>
    <path d="M690,550 L690,250 A300,300 0 0,1 836,287 Z" fill="#ef8a23"/>
    <circle cx="690" cy="550" r="155" fill="#fff"/>

    ${labelTag(1110, 340, 420, 'people 42%', C.green)}
    ${labelTag(1110, 420, 420, 'process 50%', C.blue)}
    ${labelTag(1110, 500, 420, 'business env 8%', C.orange)}

    <rect x="1110" y="590" width="620" height="14" rx="7" fill="#eee8f8"/>
    <rect x="1110" y="590" width="520" height="14" rx="7" fill="#3d8bfd"/>
    <rect x="1110" y="640" width="620" height="14" rx="7" fill="#eee8f8"/>
    <rect x="1110" y="640" width="430" height="14" rx="7" fill="#2fbf71"/>
    <rect x="1110" y="690" width="620" height="14" rx="7" fill="#eee8f8"/>
    <rect x="1110" y="690" width="140" height="14" rx="7" fill="#ef8a23"/>
  `);

  // 09 activity
  save('day2-image-09-eco-activity.svg', `
    ${quietLeftDarkBase()}
    ${card(940, 140, 860, 800, '', C.blue)}
    ${laptop(1040, 280, 640, 360, true)}
    <rect x="1030" y="690" width="700" height="92" rx="16" fill="#f3efff"/>
    <rect x="1030" y="804" width="700" height="92" rx="16" fill="#f3efff"/>
    <circle cx="1080" cy="736" r="14" fill="#6c35d4"/>
    <circle cx="1080" cy="850" r="14" fill="#3d8bfd"/>
    <rect x="1110" y="724" width="560" height="12" fill="#cfcae6"/>
    <rect x="1110" y="838" width="520" height="12" fill="#cfcae6"/>
  `);

  // 10 next steps journey
  save('day2-image-10-next-steps.svg', `
    <rect width="${W}" height="${H}" fill="url(#bgDark)"/>
    <path d="M0,1080 L680,620 L1240,620 L1920,1080 Z" fill="#7e5ad6" opacity="0.22"/>
    <path d="M180,980 C460,810 760,660 980,500 C1180,360 1430,260 1750,190" fill="none" stroke="url(#goldLine)" stroke-width="20"/>
    <circle cx="1750" cy="190" r="26" fill="#efc861"/>
    <g filter="url(#cardShadow)">
      <rect x="1160" y="120" width="620" height="300" rx="24" fill="white"/>
    </g>
    <rect x="1200" y="180" width="320" height="16" fill="#d4ccec"/>
    <rect x="1200" y="230" width="420" height="16" fill="#d4ccec"/>
    <rect x="1200" y="280" width="370" height="16" fill="#d4ccec"/>
    <rect x="1200" y="330" width="460" height="16" fill="#d4ccec"/>
  `);
}

generate();
console.log('Day 2 canonical images regenerated (v2)');
