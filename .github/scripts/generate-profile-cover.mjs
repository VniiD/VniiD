import { mkdir, writeFile } from "node:fs/promises";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="280" viewBox="0 0 1200 280" role="img" aria-labelledby="title description">
<title id="title">Engenharia de Software | Backend, arquitetura e sistemas distribuídos</title>
<desc id="description">Capa profissional em tons escuros com uma arquitetura de nós conectados e acentos neon em movimento.</desc>
<defs>
  <linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070A0F"/><stop offset="60%" stop-color="#0A1420"/><stop offset="100%" stop-color="#0A1B18"/></linearGradient>
  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22C55E"/><stop offset="55%" stop-color="#22D3EE"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient>
  <radialGradient id="green-halo"><stop stop-color="#22C55E" stop-opacity=".2"/><stop offset="1" stop-color="#22C55E" stop-opacity="0"/></radialGradient>
  <radialGradient id="blue-halo"><stop stop-color="#2563EB" stop-opacity=".2"/><stop offset="1" stop-color="#2563EB" stop-opacity="0"/></radialGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#base)}.halo{opacity:.9}.network{fill:none;stroke:#64748b;stroke-opacity:.2;stroke-width:1}
.orbit{fill:none;stroke:url(#accent);stroke-opacity:.65;stroke-width:1.5;stroke-dasharray:3 10;transform-origin:1012px 140px;animation:rotate 36s linear infinite}
.link{stroke:url(#accent);stroke-opacity:.34;stroke-width:1.5}.node{fill:#0b1520;stroke:#22d3ee;stroke-width:1.5}
.node-main{fill:#08120f;stroke:#22c55e;stroke-width:2}.node-accent{fill:#fb7185;filter:url(#glow)}
.pulse{fill:#a5f3fc;filter:url(#glow);animation:pulse 3s ease-in-out infinite alternate}
.eyebrow{fill:#5eead4;font:600 12px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:4px}
.title{fill:#f8fafc;font:700 38px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:1.5px}
.subtitle{fill:#a7b8c8;font:500 15px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:2px}
.tech{fill:#67e8f9;font:600 11px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:2px}
.rule{stroke:url(#accent);stroke-width:3;stroke-linecap:round}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes pulse{from{opacity:.2}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.orbit,.pulse{animation:none}}
</style>
<rect class="base" width="1200" height="280" rx="22"/>
<ellipse class="halo" cx="265" cy="145" rx="430" ry="260" fill="url(#green-halo)"/>
<ellipse class="halo" cx="1030" cy="150" rx="330" ry="230" fill="url(#blue-halo)"/>
<path class="network" d="M715 0v280M1180 0v280M760 38h440M760 242h440"/>
<text x="86" y="79" class="eyebrow">VINÍCIUS DE ALMEIDA FERREIRA</text>
<text x="82" y="145" class="title">ENGENHARIA DE SOFTWARE</text>
<text x="86" y="184" class="subtitle">BACKEND · ARQUITETURA · SISTEMAS DISTRIBUÍDOS</text>
<path class="rule" d="M87 214h84"/>
<text x="188" y="218" class="tech">.NET / C#  ·  PYTHON  ·  GO</text>
<g aria-hidden="true">
  <path class="link" d="M899 95 1012 140 1122 88M1012 140l-25 76 136-12M1012 140l118-5"/>
  <circle class="orbit" cx="1012" cy="140" r="96"/>
  <circle class="node" cx="899" cy="95" r="7"/>
  <circle class="node" cx="1122" cy="88" r="7"/>
  <circle class="node" cx="987" cy="216" r="7"/>
  <circle class="node" cx="1123" cy="204" r="7"/>
  <circle class="node" cx="1130" cy="135" r="5"/>
  <circle class="node-main" cx="1012" cy="140" r="15"/>
  <circle cx="1012" cy="140" r="5" fill="#22c55e"/>
  <circle class="node-accent" cx="899" cy="95" r="2.5"/>
  <circle class="pulse" cx="1122" cy="88" r="2"/>
</g>
</svg>`;

await mkdir("dist", { recursive: true });
await writeFile("dist/profile-cover.svg", svg);
