import { mkdir, writeFile } from "node:fs/promises";

const banners = [
  {
    file: "lab",
    index: "01",
    label: "LABORATÓRIO",
    title: "Ferramentas a serviço da engenharia",
    detail: "BACKEND · APIS · DADOS · CLOUD",
    accent: "#22D3EE",
  },
  {
    file: "code-map",
    index: "02",
    label: "MAPA DO CÓDIGO",
    title: "Linguagens, projetos e bytes reais",
    detail: "EXPLORAÇÃO INTERATIVA DOS REPOSITÓRIOS PÚBLICOS",
    accent: "#818CF8",
  },
  {
    file: "projects",
    index: "03",
    label: "PROJETOS EM DESTAQUE",
    title: "Problemas reais, decisões explícitas",
    detail: "PAGAMENTOS · EVENTOS · PRODUTOS · ALGORITMOS",
    accent: "#34D399",
  },
  {
    file: "foundations",
    index: "04",
    label: "FUNDAMENTOS · 42 SÃO PAULO",
    title: "Entender a máquina antes da abstração",
    detail: "C · MEMÓRIA · ESTRUTURAS DE DADOS · ALGORITMOS",
    accent: "#F472B6",
  },
];

function createBanner({ index, label, title, detail, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="124" viewBox="0 0 1200 124" role="img" aria-labelledby="title description">
<title id="title">${label}: ${title}</title>
<desc id="description">${detail}</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08111f"/><stop offset="1" stop-color="#101d2d"/></linearGradient>
  <linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".48" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".2"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#64748b" stroke-opacity=".12" stroke-width="1"/></pattern>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid)}.halo{fill:url(#halo)}
.label{fill:${accent};font:700 10px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:3px}
.title{fill:#f8fafc;font:700 22px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.detail{fill:#94a3b8;font:600 9px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.6px}
.frame{fill:none;stroke:#334155;stroke-opacity:.75}
.signal{fill:none;stroke:url(#line);stroke-width:2;stroke-dasharray:12 16;animation:travel 5s linear infinite}
.node{fill:${accent};filter:url(#glow);animation:throb 2.4s ease-in-out infinite alternate}
.orbit{fill:none;stroke:${accent};stroke-opacity:.24;stroke-width:1;stroke-dasharray:2 7;transform-origin:1125px 62px;animation:rotate 24s linear infinite}
@keyframes travel{to{stroke-dashoffset:-112}}
@keyframes throb{from{opacity:.35}to{opacity:1}}
@keyframes rotate{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.signal,.node,.orbit{animation:none}}
</style>
<rect class="base" width="1200" height="124" rx="18"/>
<rect class="grid" x="1" y="1" width="1198" height="122" rx="17"/>
<ellipse class="halo" cx="1100" cy="58" rx="210" ry="104"/>
<rect class="frame" x=".5" y=".5" width="1199" height="123" rx="18"/>
<path class="signal" d="M0 108H1200"/>
<text x="34" y="38" class="label">${index} / ${label}</text>
<text x="34" y="72" class="title">${title}</text>
<text x="35" y="96" class="detail">${detail}</text>
<g aria-hidden="true">
  <circle class="orbit" cx="1125" cy="62" r="36"/>
  <path d="M1080 62h90M1125 17v90M1093 30l64 64M1157 30l-64 64" fill="none" stroke="${accent}" stroke-opacity=".3"/>
  <circle class="node" cx="1125" cy="62" r="5"/>
  <circle cx="1080" cy="62" r="2" fill="${accent}" opacity=".7"/>
  <circle cx="1170" cy="62" r="2" fill="${accent}" opacity=".7"/>
</g>
</svg>`;
}

await mkdir("dist", { recursive: true });

for (const banner of banners) {
  await writeFile(`dist/${banner.file}-banner.svg`, createBanner(banner));
}
