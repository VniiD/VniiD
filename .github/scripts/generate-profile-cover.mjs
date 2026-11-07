import { mkdir, writeFile } from "node:fs/promises";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="340" viewBox="0 0 1200 340" role="img" aria-labelledby="title description">
<title id="title">Vinícius Ferreira | Engenharia de Software e Back-end</title>
<desc id="description">Engenheiro de Software com foco em back-end, arquitetura pragmática, segurança desde o desenho e sistemas confiáveis.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070B16"/><stop offset=".55" stop-color="#0B1426"/><stop offset="1" stop-color="#11102B"/></linearGradient>
  <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22D3EE"/><stop offset=".46" stop-color="#818CF8"/><stop offset=".76" stop-color="#E879F9"/><stop offset="1" stop-color="#34D399"/></linearGradient>
  <linearGradient id="text" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#F8FAFC"/><stop offset=".63" stop-color="#C4B5FD"/><stop offset="1" stop-color="#67E8F9"/></linearGradient>
  <radialGradient id="cyan-halo"><stop stop-color="#06B6D4" stop-opacity=".24"/><stop offset="1" stop-color="#06B6D4" stop-opacity="0"/></radialGradient>
  <radialGradient id="violet-halo"><stop stop-color="#8B5CF6" stop-opacity=".25"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#94A3B8" stroke-opacity=".09"/></pattern>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid)}.halo{opacity:.9}
.eyebrow{fill:#67E8F9;font:700 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:4px}
.name{fill:url(#text);font:800 57px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:-1.5px}
.role{fill:#F8FAFC;font:700 25px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.7px}
.focus{fill:#C4B5FD;font:600 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.4px}
.tag{fill:#E0F2FE;font:700 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag-box{fill:#0E1B31;stroke:url(#neon);stroke-opacity:.55;stroke-width:1}
.frame{fill:none;stroke:#64748B;stroke-opacity:.42}
.network{fill:none;stroke:url(#neon);stroke-opacity:.42;stroke-width:2}
.orbit{fill:none;stroke:url(#neon);stroke-width:2;stroke-dasharray:3 10;transform-origin:1006px 166px;animation:rotate 24s linear infinite}
.node{fill:#0D1728;stroke:url(#neon);stroke-width:3;filter:url(#glow)}
.pulse{fill:#A5F3FC;filter:url(#glow);animation:pulse 2.4s ease-in-out infinite alternate}
.scan{stroke:url(#neon);stroke-width:2;stroke-dasharray:24 20;animation:scan 5s linear infinite}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes pulse{from{opacity:.2;transform:scale(.7)}to{opacity:1;transform:scale(1.25)}}
@keyframes scan{to{stroke-dashoffset:-176}}
@media(prefers-reduced-motion:reduce){.orbit,.pulse,.scan{animation:none}}
</style>
<rect class="base" width="1200" height="340" rx="26"/>
<rect class="grid" x="1" y="1" width="1198" height="338" rx="25"/>
<ellipse class="halo" cx="358" cy="166" rx="490" ry="260" fill="url(#cyan-halo)"/>
<ellipse class="halo" cx="1020" cy="172" rx="360" ry="255" fill="url(#violet-halo)"/>
<rect class="frame" x=".5" y=".5" width="1199" height="339" rx="26"/>
<text x="54" y="66" class="eyebrow">SOFTWARE ENGINEERING · BACK-END</text>
<text x="50" y="139" class="name">VINÍCIUS FERREIRA</text>
<text x="56" y="185" class="role">Engenheiro de Software · Back-end</text>
<text x="56" y="222" class="focus">ARQUITETURA PRAGMÁTICA · SYSTEM DESIGN · SEGURANÇA</text>
<rect class="tag-box" x="56" y="255" width="125" height="42" rx="13"/>
<rect class="tag-box" x="195" y="255" width="125" height="42" rx="13"/>
<rect class="tag-box" x="334" y="255" width="125" height="42" rx="13"/>
<rect class="tag-box" x="473" y="255" width="138" height="42" rx="13"/>
<text x="118" y="282" text-anchor="middle" class="tag">.NET / C#</text>
<text x="257" y="282" text-anchor="middle" class="tag">PYTHON</text>
<text x="396" y="282" text-anchor="middle" class="tag">GO</text>
<text x="542" y="282" text-anchor="middle" class="tag">42 SÃO PAULO</text>
<path class="scan" d="M0 326H1200"/>
<g aria-hidden="true">
  <path class="network" d="M864 112 1006 74 1117 137 1056 254 914 242 864 112M1006 74l50 180m-192-142 192 142m61-117L914 242"/>
  <circle class="orbit" cx="1006" cy="166" r="115"/>
  <circle class="node" cx="864" cy="112" r="9"/>
  <circle class="node" cx="1006" cy="74" r="9"/>
  <circle class="node" cx="1117" cy="137" r="9"/>
  <circle class="node" cx="1056" cy="254" r="9"/>
  <circle class="node" cx="914" cy="242" r="9"/>
  <circle class="node" cx="1006" cy="166" r="17"/>
  <circle class="pulse" cx="1006" cy="166" r="6"/>
</g>
</svg>`;

const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="720" viewBox="0 0 640 720" role="img" aria-labelledby="title description">
<title id="title">Vinícius Ferreira | Engenharia de Software e Back-end</title>
<desc id="description">Engenheiro de Software com foco em back-end, arquitetura pragmática, System Design e segurança.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070B16"/><stop offset=".55" stop-color="#0B1426"/><stop offset="1" stop-color="#11102B"/></linearGradient>
  <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22D3EE"/><stop offset=".46" stop-color="#818CF8"/><stop offset=".76" stop-color="#E879F9"/><stop offset="1" stop-color="#34D399"/></linearGradient>
  <linearGradient id="text" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#F8FAFC"/><stop offset=".63" stop-color="#C4B5FD"/><stop offset="1" stop-color="#67E8F9"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="#8B5CF6" stop-opacity=".24"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#94A3B8" stroke-opacity=".09"/></pattern>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid)}.halo{fill:url(#halo)}
.eyebrow{fill:#67E8F9;font:700 21px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:3px}
.name{fill:url(#text);font:800 66px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:-1px}
.role{fill:#F8FAFC;font:700 31px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.focus{fill:#C4B5FD;font:700 22px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag{fill:#E0F2FE;font:700 24px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag-box{fill:#0E1B31;stroke:url(#neon);stroke-opacity:.65;stroke-width:2}
.frame{fill:none;stroke:#64748B;stroke-opacity:.42}
.network{fill:none;stroke:url(#neon);stroke-opacity:.55;stroke-width:3}
.orbit{fill:none;stroke:url(#neon);stroke-width:2;stroke-dasharray:3 10;transform-origin:320px 595px;animation:rotate 24s linear infinite}
.node{fill:#0D1728;stroke:url(#neon);stroke-width:3;filter:url(#glow)}
.pulse{fill:#A5F3FC;filter:url(#glow);animation:pulse 2.4s ease-in-out infinite alternate}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes pulse{from{opacity:.2;transform:scale(.7)}to{opacity:1;transform:scale(1.25)}}
@media(prefers-reduced-motion:reduce){.orbit,.pulse{animation:none}}
</style>
<rect class="base" width="640" height="720" rx="26"/>
<rect class="grid" x="1" y="1" width="638" height="718" rx="25"/>
<ellipse class="halo" cx="320" cy="590" rx="280" ry="180"/>
<rect class="frame" x=".5" y=".5" width="639" height="719" rx="26"/>
<text x="38" y="62" class="eyebrow">SOFTWARE ENGINEERING</text>
<text x="34" y="153" class="name">VINÍCIUS</text>
<text x="34" y="230" class="name">FERREIRA</text>
<text x="40" y="294" class="role">Engenheiro de Software</text>
<text x="40" y="338" class="role">Back-end</text>
<text x="40" y="393" class="focus">ARQUITETURA · SYSTEM DESIGN</text>
<text x="40" y="423" class="focus">SEGURANÇA · CONFIABILIDADE</text>
<rect class="tag-box" x="40" y="458" width="166" height="52" rx="15"/>
<rect class="tag-box" x="237" y="458" width="166" height="52" rx="15"/>
<rect class="tag-box" x="434" y="458" width="166" height="52" rx="15"/>
<text x="123" y="492" text-anchor="middle" class="tag">.NET / C#</text>
<text x="320" y="492" text-anchor="middle" class="tag">PYTHON</text>
<text x="517" y="492" text-anchor="middle" class="tag">GO</text>
<g aria-hidden="true">
  <path class="network" d="M220 607 320 552 420 607 370 665 270 665zM220 607l150 58m-50-113 50 113m50-58-150 58"/>
  <circle class="orbit" cx="320" cy="610" r="85"/>
  <circle class="node" cx="220" cy="607" r="9"/>
  <circle class="node" cx="320" cy="552" r="9"/>
  <circle class="node" cx="420" cy="607" r="9"/>
  <circle class="node" cx="370" cy="665" r="9"/>
  <circle class="node" cx="270" cy="665" r="9"/>
  <circle class="node" cx="320" cy="610" r="16"/>
  <circle class="pulse" cx="320" cy="610" r="6"/>
</g>
</svg>`;

await mkdir("dist", { recursive: true });
await writeFile("dist/profile-cover.svg", svg);
await writeFile("dist/profile-cover-mobile.svg", mobileSvg);
