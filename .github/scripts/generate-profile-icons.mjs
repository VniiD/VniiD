import { mkdir, writeFile } from "node:fs/promises";

const icons = {
  activity: {
    accent: "#22D3EE",
    markup: '<path d="M7 48h11l7-20 11 31 8-20h13"/><path d="M8 13v38M56 13v38" opacity=".45"/>',
  },
  articles: {
    accent: "#A78BFA",
    markup: '<path d="M10 12h17a9 9 0 0 1 9 9v32a9 9 0 0 0-9-9H10z"/><path d="M54 12H37a9 9 0 0 0-9 9v32a9 9 0 0 1 9-9h17z"/><path d="M16 22h10M16 29h10M44 22h5M44 29h5"/>',
  },
  courses: {
    accent: "#FBBF24",
    markup: '<path d="M12 12h40v40H12z"/><path d="M21 22h22m-22 8h22m-22 8h14"/><path d="M46 42v14l-7-4-7 4V42"/>',
  },
  lab: {
    accent: "#22D3EE",
    markup: '<circle cx="32" cy="32" r="7"/><circle cx="13" cy="17" r="4"/><circle cx="51" cy="14" r="4"/><circle cx="49" cy="50" r="4"/><circle cx="12" cy="48" r="4"/><path d="m18 20 9 8m10-1 11-10M37 37l9 10m-19-9-11 8"/>',
  },
  "code-map": {
    accent: "#818CF8",
    markup: '<path d="M32 8a24 24 0 1 0 24 24H32z"/><path d="M39 8v17h17A24 24 0 0 0 39 8z"/><circle cx="21" cy="34" r="2" fill="currentColor"/><circle cx="29" cy="43" r="2" fill="currentColor"/>',
  },
  projects: {
    accent: "#34D399",
    markup: '<path d="m32 8 21 12v24L32 56 11 44V20z"/><path d="m11 20 21 13 21-13M32 33v23"/><path d="m21 14 21 12"/>',
  },
  foundations: {
    accent: "#F472B6",
    markup: '<rect x="17" y="17" width="30" height="30" rx="4"/><rect x="25" y="25" width="14" height="14" rx="2"/><path d="M23 7v10m9-10v10m9-10v10M23 47v10m9-10v10m9-10v10M7 23h10m-10 9h10m-10 9h10m30-18h10m-10 9h10m-10 9h10"/>',
  },
  education: {
    accent: "#FBBF24",
    markup: '<path d="m6 24 26-14 26 14-26 14z"/><path d="M17 31v13c8 7 22 7 30 0V31M57 25v17"/><circle cx="57" cy="46" r="3"/>',
  },
  degree: {
    accent: "#FBBF24",
    markup: '<path d="M8 54h48M13 50V25m13 25V25m12 25V25m13 25V25M8 22l24-12 24 12zM5 57h54"/>',
  },
  security: {
    accent: "#34D399",
    markup: '<path d="M32 8 52 16v14c0 13-8 21-20 27-12-6-20-14-20-27V16z"/><path d="m22 32 7 7 14-16"/>',
  },
  ai: {
    accent: "#C084FC",
    markup: '<path d="M32 9v8m0 30v8M9 32h8m30 0h8M16 16l6 6m20 20 6 6m0-32-6 6m-20 20-6 6"/><circle cx="32" cy="32" r="13"/><path d="M27 33h10m-5-5v10"/>',
  },
  "42": {
    accent: "#F472B6",
    markup: '<text x="32" y="43" text-anchor="middle" fill="currentColor" stroke="none" font-family="ui-monospace,monospace" font-size="29" font-weight="800">42</text>',
  },
  cisco: {
    accent: "#38BDF8",
    markup: '<path d="M13 18v12m9-20v17m10-20v17m10-14v17m9-9v12M8 40h48M12 48h40"/>',
  },
  dio: {
    accent: "#A78BFA",
    markup: '<text x="32" y="41" text-anchor="middle" fill="currentColor" stroke="none" font-family="ui-sans-serif,system-ui,sans-serif" font-size="21" font-weight="800">DIO</text>',
  },
  google: {
    accent: "#60A5FA",
    markup: '<text x="32" y="45" text-anchor="middle" fill="currentColor" stroke="none" font-family="ui-sans-serif,system-ui,sans-serif" font-size="38" font-weight="800">G</text>',
  },
  enap: {
    accent: "#34D399",
    markup: '<path d="M10 54h44M15 48V35h8v13m8 0V25h8v23m8 0V13h8v35"/>',
  },
};

function createIcon(name, { accent, markup }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-labelledby="title">
<title id="title">${name}</title>
<style>svg{color:${accent}}.mark{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}</style>
<circle cx="32" cy="32" r="30" fill="${accent}" fill-opacity=".08" stroke="${accent}" stroke-opacity=".5"/>
<g class="mark">${markup}</g>
</svg>`;
}

const dividerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="8" viewBox="0 0 1200 8" role="img" aria-label="Divisor neon">
<defs><linearGradient id="neon"><stop stop-color="#22D3EE" stop-opacity="0"/><stop offset=".25" stop-color="#22D3EE"/><stop offset=".72" stop-color="#34D399"/><stop offset="1" stop-color="#34D399" stop-opacity="0"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2"/></filter></defs>
<path d="M4 4h1192" stroke="url(#neon)" stroke-width="5" opacity=".45" filter="url(#glow)"/>
<path d="M4 4h1192" stroke="url(#neon)" stroke-width="1.5"/>
</svg>`;

const projectTiles = [
  {
    file: "project-42-foundations.svg",
    title: "42 São Paulo",
    description: [
      "Push_swap · Libft · ft_printf",
      "get_next_line · Python OOP",
      "Algoritmos, C e fundamentos de programação.",
    ],
    stack: "C · Python · Algoritmos",
    accent: "#F472B6",
  },
  {
    file: "project-splitpay.svg",
    title: "SplitPay POS",
    description: [
      "Pagamentos com Pix e cartões, split,",
      "Outbox/Kafka e ledger.",
      "85 testes automatizados.",
    ],
    stack: "C# · .NET · Kafka · MongoDB · Docker",
    accent: "#34D399",
  },
  {
    file: "project-split-payment-platform.svg",
    title: "Split Payment Platform",
    description: [
      "Pagamentos orientados a eventos,",
      "idempotência e transactional outbox.",
    ],
    stack: ".NET · Kafka · MongoDB · Docker",
    accent: "#22D3EE",
  },
  {
    file: "project-xp-g7.svg",
    title: "Plataforma XP G7",
    description: [
      "Back-end de copiloto financeiro com",
      "function calling e transcrição por voz.",
      "Destaque de inovação no hackathon.",
    ],
    stack: "Python · FastAPI · PostgreSQL · Redis",
    accent: "#818CF8",
  },
  {
    file: "project-a-maze-ing.svg",
    title: "A-Maze-ing",
    description: [
      "Labirintos com Backtracker, Prim e Kruskal;",
      "caminho mínimo com BFS e tipagem estrita.",
    ],
    stack: "Python",
    accent: "#F472B6",
  },
  {
    file: "project-pixcore.svg",
    title: "PixCore",
    description: [
      "Ledger de partidas dobradas com gRPC/mTLS,",
      "PostgreSQL, Kafka e SDK Go.",
      "Próximos serviços no roadmap.",
    ],
    stack: "Go · PostgreSQL · Kafka",
    accent: "#FBBF24",
  },
];

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

function createProjectTile({ title, description, stack, accent }) {
  const descriptionLines = description.map(
    (line, index) => `<text x="34" y="${105 + index * 30}" class="description">${escapeXml(line)}</text>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(title)}</title>
<desc id="description">${escapeXml(description.join(" "))} ${escapeXml(stack)}</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0B1424"/><stop offset="1" stop-color="#11102A"/></linearGradient>
  <linearGradient id="border"><stop stop-color="${accent}"/><stop offset="1" stop-color="#818CF8"/></linearGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#94A3B8" stroke-opacity=".07"/></pattern>
</defs>
<style>
.title{fill:#F8FAFC;font:700 29px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.description{fill:#CBD5E1;font:500 19px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.stack{fill:${accent};font:700 15px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.5px}
</style>
<rect x="2" y="2" width="636" height="236" rx="22" fill="url(#background)" stroke="url(#border)" stroke-width="2"/>
<rect x="3" y="3" width="634" height="234" rx="21" fill="url(#grid)"/>
<path d="M34 67h572" stroke="${accent}" stroke-opacity=".45"/>
<text x="34" y="49" class="title">${escapeXml(title)}</text>
${descriptionLines}
<text x="34" y="216" class="stack">${escapeXml(stack)}</text>
</svg>`;
}

await mkdir("dist", { recursive: true });

for (const [name, icon] of Object.entries(icons)) {
  await writeFile(`dist/icon-${name}.svg`, createIcon(name, icon));
}

await writeFile("dist/neon-divider.svg", dividerSvg);

for (const tile of projectTiles) {
  await writeFile(`dist/${tile.file}`, createProjectTile(tile));
}
