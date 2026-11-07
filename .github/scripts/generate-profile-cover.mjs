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
  <clipPath id="cover-clip"><rect width="1200" height="340" rx="26"/></clipPath>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid);animation:grid-pulse 8s ease-in-out infinite alternate}.halo{opacity:.9;transform-box:fill-box;transform-origin:center;animation:halo-drift 9s ease-in-out infinite alternate}
.eyebrow{fill:#67E8F9;font:700 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:4px}
.name{fill:url(#text);font:800 57px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:-1.5px}
.role{fill:#F8FAFC;font:700 25px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.7px}
.focus{fill:#C4B5FD;font:600 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.4px}
.tag{fill:#E0F2FE;font:700 18px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag-box{fill:#0E1B31;stroke:url(#neon);stroke-opacity:.55;stroke-width:1;animation:tag-glow 5s ease-in-out infinite alternate}
.frame{fill:none;stroke:#64748B;stroke-opacity:.42}
.art-orbit{fill:none;stroke:url(#neon);stroke-opacity:.42;stroke-width:1.5;stroke-dasharray:3 9;transform-box:view-box;transform-origin:1000px 174px;animation:rotate 32s linear infinite}
.art-orbit-inner{stroke-opacity:.26;stroke-dasharray:2 7;animation:rotate-reverse 24s linear infinite}
.art-route{fill:none;stroke:url(#neon);stroke-opacity:.48;stroke-width:1.5;stroke-dasharray:7 9;animation:route-flow 5s linear infinite}
.art-route-delay{animation-delay:-2.5s}
.art-node{fill:#0D1728;stroke:url(#neon);stroke-width:2.5;filter:url(#glow);transform-box:fill-box;transform-origin:center;animation:node-pulse 3s ease-in-out infinite}
.art-node-delay{animation-delay:-1.5s}
.art-core{fill:#0D1728;stroke:url(#neon);stroke-width:2;filter:url(#glow);transform-box:fill-box;transform-origin:center;animation:core-pulse 4s ease-in-out infinite}
.art-core-lines{fill:none;stroke:#A5F3FC;stroke-opacity:.85;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.art-packet{fill:#A5F3FC;filter:url(#glow);animation:packet-pulse 2s ease-in-out infinite}
.art-packet-delay{animation-delay:-1s}
.scan{stroke:url(#neon);stroke-width:2;stroke-dasharray:24 20;animation:scan 5s linear infinite}
.sweep{opacity:.06;fill:url(#neon);animation:sweep 16s linear infinite}
@keyframes grid-pulse{to{opacity:.62}}
@keyframes halo-drift{to{transform:scale(1.05);opacity:.65}}
@keyframes tag-glow{to{stroke-opacity:.9}}
@keyframes sweep{from{transform:translateX(-140px)}to{transform:translateX(1200px)}}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes rotate-reverse{to{transform:rotate(-360deg)}}
@keyframes route-flow{to{stroke-dashoffset:-64}}
@keyframes node-pulse{0%,100%{opacity:.58;transform:scale(.78)}50%{opacity:1;transform:scale(1.18)}}
@keyframes core-pulse{0%,100%{transform:scale(.96)}50%{transform:scale(1.04)}}
@keyframes packet-pulse{0%,100%{opacity:.28;transform:scale(.65)}50%{opacity:1;transform:scale(1.35)}}
@keyframes scan{to{stroke-dashoffset:-176}}
@media(prefers-reduced-motion:reduce){.grid,.halo,.tag-box,.sweep,.art-orbit,.art-orbit-inner,.art-route,.art-node,.art-core,.art-packet,.scan{animation:none}}
</style>
<rect class="base" width="1200" height="340" rx="26"/>
<rect class="grid" x="1" y="1" width="1198" height="338" rx="25"/>
<ellipse class="halo" cx="358" cy="166" rx="490" ry="260" fill="url(#cyan-halo)"/>
<ellipse class="halo" cx="1020" cy="172" rx="360" ry="255" fill="url(#violet-halo)"/>
<rect class="frame" x=".5" y=".5" width="1199" height="339" rx="26"/>
<g clip-path="url(#cover-clip)" aria-hidden="true"><rect class="sweep" x="0" y="1" width="140" height="338"/></g>
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
<text x="542" y="282" text-anchor="middle" class="tag">42 SP</text>
<path class="scan" d="M0 326H1200"/>
<g aria-hidden="true">
  <circle class="art-orbit" cx="1000" cy="174" r="132"/>
  <ellipse class="art-orbit art-orbit-inner" cx="1000" cy="174" rx="102" ry="55"/>
  <path class="art-route" d="M870 112C908 112 918 144 958 158M1128 112C1090 112 1082 144 1042 158M1118 250C1082 238 1065 214 1040 196M880 250C918 238 936 214 960 196M1000 44C1000 82 1000 108 1000 137"/>
  <path class="art-route art-route-delay" d="M870 112C908 112 918 144 958 158M1128 112C1090 112 1082 144 1042 158"/>
  <circle class="art-node" cx="870" cy="112" r="6"/>
  <circle class="art-node art-node-delay" cx="1128" cy="112" r="6"/>
  <circle class="art-node" cx="1118" cy="250" r="6"/>
  <circle class="art-node art-node-delay" cx="880" cy="250" r="6"/>
  <circle class="art-node" cx="1000" cy="44" r="6"/>
  <path class="art-core" d="M1000 132 1036 153v42l-36 21-36-21v-42z"/>
  <path class="art-core-lines" d="m980 158 20 12 20-12m-40 12v18l20 12 20-12v-18m-20 0v30"/>
  <circle class="art-packet" r="3.5"><animateMotion dur="5s" repeatCount="indefinite" path="M870 112C908 112 918 144 958 158"/></circle>
  <circle class="art-packet art-packet-delay" r="3.5"><animateMotion dur="5s" repeatCount="indefinite" path="M1118 250C1082 238 1065 214 1040 196"/></circle>
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
  <clipPath id="cover-clip"><rect width="640" height="720" rx="26"/></clipPath>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.base{fill:url(#background)}.grid{fill:url(#grid);animation:grid-pulse 8s ease-in-out infinite alternate}.halo{fill:url(#halo);transform-box:fill-box;transform-origin:center;animation:halo-drift 9s ease-in-out infinite alternate}
.eyebrow{fill:#67E8F9;font:700 21px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:3px}
.name{fill:url(#text);font:800 66px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:-1px}
.role{fill:#F8FAFC;font:700 31px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.focus{fill:#C4B5FD;font:700 22px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag{fill:#E0F2FE;font:700 24px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1px}
.tag-box{fill:#0E1B31;stroke:url(#neon);stroke-opacity:.65;stroke-width:2;animation:tag-glow 5s ease-in-out infinite alternate}
.frame{fill:none;stroke:#64748B;stroke-opacity:.42}
.art-orbit{fill:none;stroke:url(#neon);stroke-opacity:.42;stroke-width:1.5;stroke-dasharray:3 9;transform-box:view-box;transform-origin:320px 610px;animation:rotate 32s linear infinite}
.art-orbit-inner{stroke-opacity:.26;stroke-dasharray:2 7;animation:rotate-reverse 24s linear infinite}
.art-route{fill:none;stroke:url(#neon);stroke-opacity:.52;stroke-width:2;stroke-dasharray:7 9;animation:route-flow 5s linear infinite}
.art-route-delay{animation-delay:-2.5s}
.art-node{fill:#0D1728;stroke:url(#neon);stroke-width:2.5;filter:url(#glow);transform-box:fill-box;transform-origin:center;animation:node-pulse 3s ease-in-out infinite}
.art-node-delay{animation-delay:-1.5s}
.art-core{fill:#0D1728;stroke:url(#neon);stroke-width:2;filter:url(#glow);transform-box:fill-box;transform-origin:center;animation:core-pulse 4s ease-in-out infinite}
.art-core-lines{fill:none;stroke:#A5F3FC;stroke-opacity:.85;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.art-packet{fill:#A5F3FC;filter:url(#glow);animation:packet-pulse 2s ease-in-out infinite}
.art-packet-delay{animation-delay:-1s}
.sweep{opacity:.06;fill:url(#neon);animation:sweep 16s linear infinite}
@keyframes grid-pulse{to{opacity:.62}}
@keyframes halo-drift{to{transform:scale(1.05);opacity:.65}}
@keyframes tag-glow{to{stroke-opacity:.9}}
@keyframes sweep{from{transform:translateX(-100px)}to{transform:translateX(640px)}}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes rotate-reverse{to{transform:rotate(-360deg)}}
@keyframes route-flow{to{stroke-dashoffset:-64}}
@keyframes node-pulse{0%,100%{opacity:.58;transform:scale(.78)}50%{opacity:1;transform:scale(1.18)}}
@keyframes core-pulse{0%,100%{transform:scale(.96)}50%{transform:scale(1.04)}}
@keyframes packet-pulse{0%,100%{opacity:.28;transform:scale(.65)}50%{opacity:1;transform:scale(1.35)}}
@media(prefers-reduced-motion:reduce){.grid,.halo,.tag-box,.sweep,.art-orbit,.art-orbit-inner,.art-route,.art-node,.art-core,.art-packet{animation:none}}
</style>
<rect class="base" width="640" height="720" rx="26"/>
<rect class="grid" x="1" y="1" width="638" height="718" rx="25"/>
<ellipse class="halo" cx="320" cy="590" rx="280" ry="180"/>
<rect class="frame" x=".5" y=".5" width="639" height="719" rx="26"/>
<g clip-path="url(#cover-clip)" aria-hidden="true"><rect class="sweep" x="0" y="1" width="100" height="718"/></g>
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
  <circle class="art-orbit" cx="320" cy="610" r="108"/>
  <ellipse class="art-orbit art-orbit-inner" cx="320" cy="610" rx="82" ry="45"/>
  <path class="art-route" d="M230 535C256 535 269 565 287 582M410 535C384 535 371 565 353 582M410 680C384 675 370 652 353 637M230 680C256 675 270 652 287 637M320 500C320 525 320 548 320 574"/>
  <path class="art-route art-route-delay" d="M230 535C256 535 269 565 287 582M410 535C384 535 371 565 353 582"/>
  <circle class="art-node" cx="230" cy="535" r="6"/>
  <circle class="art-node art-node-delay" cx="410" cy="535" r="6"/>
  <circle class="art-node" cx="410" cy="680" r="6"/>
  <circle class="art-node art-node-delay" cx="230" cy="680" r="6"/>
  <circle class="art-node" cx="320" cy="500" r="6"/>
  <path class="art-core" d="M320 570 352 588v38l-32 19-32-19v-38z"/>
  <path class="art-core-lines" d="m302 592 18 11 18-11m-36 11v17l18 11 18-11v-17m-18 0v28"/>
  <circle class="art-packet" r="3.5"><animateMotion dur="5s" repeatCount="indefinite" path="M230 535C256 535 269 565 287 582"/></circle>
  <circle class="art-packet art-packet-delay" r="3.5"><animateMotion dur="5s" repeatCount="indefinite" path="M410 680C384 675 370 652 353 637"/></circle>
</g>
</svg>`;

await mkdir("dist", { recursive: true });
await writeFile("dist/profile-cover.svg", svg);
await writeFile("dist/profile-cover-mobile.svg", mobileSvg);
