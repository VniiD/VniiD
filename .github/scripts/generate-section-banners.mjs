import { mkdir, writeFile } from "node:fs/promises";

const banners = [
  { file: "lab", accent: "#22D3EE", motif: "nodes" },
  { file: "projects", accent: "#34D399", motif: "blocks" },
  { file: "foundations", accent: "#F472B6", motif: "chip" },
];

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
  santander: {
    accent: "#FB7185",
    markup: '<path d="M32 8c2 10-10 13-9 25 1 7 6 10 11 8-2 7-9 9-15 5-9-7-6-21 2-29 5-5 9-5 11-9zm4 8c9 7 15 15 12 25-2 8-8 12-16 13 7-5 8-12 4-18-3-5-4-12 0-20z"/>',
  },
  google: {
    accent: "#60A5FA",
    markup: '<text x="32" y="45" text-anchor="middle" fill="currentColor" stroke="none" font-family="ui-sans-serif,system-ui,sans-serif" font-size="38" font-weight="800">G</text>',
  },
  enap: {
    accent: "#34D399",
    markup: '<path d="M10 54h44M15 48V35h8v13m8 0V25h8v23m8 0V13h8v35"/>',
  },
  ibsec: {
    accent: "#FBBF24",
    markup: '<path d="M32 8 52 16v14c0 13-8 21-20 27-12-6-20-14-20-27V16z"/><path d="m23 32 6 6 13-14"/>',
  },
  isc2: {
    accent: "#2DD4BF",
    markup: '<path d="M32 8 52 16v14c0 13-8 21-20 27-12-6-20-14-20-27V16z"/><path d="M24 33a9 9 0 1 1 16 6m-8-15v9l6 4"/>',
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

function createBanner({ accent, motif }) {
  const graphics = {
    nodes: '<path d="M810 90 930 42l112 64 80-50M810 90l104 76 128-60 80 66"/><circle cx="810" cy="90" r="10"/><circle cx="930" cy="42" r="10"/><circle cx="1042" cy="106" r="10"/><circle cx="1122" cy="56" r="10"/><circle cx="914" cy="166" r="10"/><circle cx="1042" cy="106" r="10"/><circle cx="1122" cy="172" r="10"/>',
    blocks: '<path d="m850 72 56-32 56 32v64l-56 32-56-32zm112 0 56-32 56 32v64l-56 32-56-32"/><path d="m850 72 56 32 56-32m-56 32v64m56-96 56 32 56-32m-56 32v64"/>',
    chip: '<rect x="902" y="48" width="120" height="120" rx="14"/><rect x="936" y="82" width="52" height="52" rx="8"/><path d="M926 28v20m36-20v20m36-20v20m-72 120v20m36-20v20m36-20v20M882 72h20m-20 36h20m-20 36h20m120-72h20m-20 36h20m-20 36h20"/>',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="184" viewBox="0 0 1200 184" role="img" aria-label="Animação neon de ${motif}">
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08111f"/><stop offset="1" stop-color="#101d2d"/></linearGradient>
  <linearGradient id="beam"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".2"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#64748b" stroke-opacity=".12"/></pattern>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid)}.halo{fill:url(#halo)}
.frame{fill:none;stroke:#334155;stroke-opacity:.75}
.net{fill:none;stroke:${accent};stroke-opacity:.48;stroke-width:2}
.node{fill:#08111f;stroke:${accent};stroke-width:3;filter:url(#glow)}
.pulse{fill:none;stroke:url(#beam);stroke-width:3;stroke-dasharray:20 22;animation:travel 4s linear infinite}
.orbit{fill:none;stroke:${accent};stroke-opacity:.35;stroke-width:2;stroke-dasharray:4 10;transform-origin:1050px 104px;animation:rotate 24s linear infinite}
@keyframes travel{to{stroke-dashoffset:-168}}
@keyframes rotate{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.pulse,.orbit{animation:none}}
</style>
<rect class="base" width="1200" height="184" rx="20"/>
<rect class="grid" x="1" y="1" width="1198" height="182" rx="19"/>
<ellipse class="halo" cx="1050" cy="104" rx="280" ry="138"/>
<rect class="frame" x=".5" y=".5" width="1199" height="183" rx="20"/>
<path class="pulse" d="M0 166H1200"/>
<g class="net">${graphics[motif]}</g>
<circle class="orbit" cx="1050" cy="104" r="92"/>
</svg>`;
}

const dividerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="8" viewBox="0 0 1200 8" role="img" aria-label="Divisor neon">
<defs><linearGradient id="neon"><stop stop-color="#22D3EE" stop-opacity="0"/><stop offset=".25" stop-color="#22D3EE"/><stop offset=".72" stop-color="#34D399"/><stop offset="1" stop-color="#34D399" stop-opacity="0"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2"/></filter></defs>
<path d="M4 4h1192" stroke="url(#neon)" stroke-width="5" opacity=".45" filter="url(#glow)"/>
<path d="M4 4h1192" stroke="url(#neon)" stroke-width="1.5"/>
</svg>`;

await mkdir("dist", { recursive: true });

for (const banner of banners) {
  await writeFile(`dist/${banner.file}-banner.svg`, createBanner(banner));
}

for (const [name, icon] of Object.entries(icons)) {
  await writeFile(`dist/icon-${name}.svg`, createIcon(name, icon));
}

await writeFile("dist/neon-divider.svg", dividerSvg);
