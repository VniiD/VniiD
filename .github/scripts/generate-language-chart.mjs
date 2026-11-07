import { mkdir, readFile, writeFile } from "node:fs/promises";

const username = "VniiD";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error("GITHUB_TOKEN is required to fetch public repository language data");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}): ${url}`);
  }

  return {
    body: await response.json(),
    link: response.headers.get("link"),
  };
}

async function getRepositories() {
  const repositories = [];
  let url = `https://api.github.com/users/${username}/repos?type=owner&visibility=public&per_page=100&sort=pushed`;

  while (url) {
    const result = await fetchJson(url);
    repositories.push(...result.body);
    url = result.link?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? "";
  }

  return repositories.filter(
    (repo) => !repo.private && !repo.fork && !repo.archived && repo.name !== username,
  );
}

const repositories = await getRepositories();
const languageData = await Promise.all(
  repositories.map(async (repo) => {
    const { body } = await fetchJson(repo.languages_url);
    return { repository: repo.name, url: repo.html_url, languages: body };
  }),
);
const totals = new Map();

for (const { repository, languages } of languageData) {
  for (const [language, bytes] of Object.entries(languages)) {
    if (typeof bytes !== "number" || bytes < 0) {
      throw new Error(`Invalid language byte count for ${language}`);
    }

    totals.set(language, (totals.get(language) ?? 0) + bytes);
  }
}

const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
if (sorted.length === 0) {
  throw new Error("No public repository language data was returned");
}

const topLanguageNames = new Set(sorted.slice(0, 5).map(([language]) => language));
if (totals.has("Go")) {
  topLanguageNames.add("Go");
}
const topLanguages = sorted.filter(([language]) => topLanguageNames.has(language));
const otherLanguages = sorted.filter(([language]) => !topLanguageNames.has(language));
const top = [...topLanguages];
const remainder = otherLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);
if (remainder > 0) {
  top.push(["Outros", remainder]);
}

const totalBytes = top.reduce((sum, [, bytes]) => sum + bytes, 0);
const otherLanguageNames = new Set(otherLanguages.map(([language]) => language));
const colors = {
  C: "#A3E635",
  "C#": "#C084FC",
  Go: "#22D3EE",
  Java: "#FB923C",
  JavaScript: "#FACC15",
  Python: "#38BDF8",
  Rust: "#F97316",
  TypeScript: "#F472B6",
  Outros: "#E879F9",
};
const palette = ["#22D3EE", "#A3E635", "#F472B6", "#FB923C", "#818CF8", "#FACC15"];
const chartRadius = 106;
const circumference = 2 * Math.PI * chartRadius;
let offset = 0;
const slices = top.map(([language, bytes], index) => {
  const ratio = bytes / totalBytes;
  const length = ratio * circumference;
  const color = colors[language] ?? palette[index % palette.length];
  const currentOffset = offset;
  offset += length;
  const includedLanguages = language === "Outros"
    ? otherLanguageNames
    : new Set([language]);
  const projects = languageData
    .map(({ repository, url, languages }) => {
      const projectBytes = Object.entries(languages).reduce(
        (sum, [projectLanguage, projectLanguageBytes]) =>
          sum + (includedLanguages.has(projectLanguage) ? projectLanguageBytes : 0),
        0,
      );
      return projectBytes > 0
        ? { name: repository, url, bytes: projectBytes }
        : null;
    })
    .filter((project) => project !== null)
    .sort((first, second) => second.bytes - first.bytes);

  return {
    language,
    bytes,
    repositories: projects.length,
    projects,
    ratio,
    color,
    dash: `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`,
    offset: currentOffset.toFixed(2),
  };
});

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);

const rowHeight = 48;
const height = 120 + slices.length * rowHeight + 22;
const centerY = Math.round(height / 2);
const firstRowY = 112;
const barWidth = 610;
const interactiveMapUrl = `https://${username.toLowerCase()}.github.io/${username}/`;
const legend = slices.map((slice, index) => {
  const y = firstRowY + index * rowHeight;
  const percent = `${(slice.ratio * 100).toFixed(1)}%`;
  const projectNames = slice.projects.map(({ name }) => name).join(", ");
  const href = `${interactiveMapUrl}#language=${encodeURIComponent(slice.language)}`;
  return `<a class="language-link row-${index}" href="${href}" target="_top" style="--delay:${index * 100}ms">
  <title>${escapeXml(`${slice.language} · ${percent} · Projetos: ${projectNames}`)}</title>
  <rect class="row-hit-area" x="350" y="${y - 24}" width="790" height="${rowHeight}" fill="transparent"/>
  <g class="language-row">
  <circle cx="365" cy="${y - 6}" r="7" fill="${slice.color}"/>
  <text x="384" y="${y}" class="language">${escapeXml(slice.language)}</text>
  <text x="1120" y="${y}" text-anchor="end" class="percent">${percent}</text>
  <rect x="365" y="${y + 10}" width="${barWidth}" height="9" rx="4.5" fill="#1e293b"/>
  <rect class="bar" x="365" y="${y + 10}" width="${(slice.ratio * barWidth).toFixed(2)}" height="9" rx="4.5" fill="${slice.color}"/>
</g></a>`;
}).join("");
const rings = slices.map((slice, index) =>
  `<a class="slice-link" href="${interactiveMapUrl}#language=${encodeURIComponent(slice.language)}" target="_top"><circle class="slice slice-${index}" cx="174" cy="${centerY}" r="${chartRadius}" fill="none" stroke="${slice.color}" stroke-width="32" stroke-dasharray="${slice.dash}" stroke-dashoffset="-${slice.offset}" pathLength="${circumference.toFixed(2)}" style="--dash:${slice.dash};--delay:${index * 100}ms;--pulse-delay:${1800 + index * 180}ms;color:${slice.color}"><title>${escapeXml(`${slice.language} · ${(slice.ratio * 100).toFixed(1)}% · Projetos: ${slice.projects.map(({ name }) => name).join(", ")}`)}</title></circle></a>`,
).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title description">
<title id="title">Mapa animado do código de ${username}</title>
<desc id="description">Gráfico animado com a distribuição das linguagens nos repositórios públicos.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08111f"/><stop offset="1" stop-color="#101d2d"/></linearGradient>
  <radialGradient id="ambient-cyan"><stop stop-color="#22D3EE" stop-opacity=".16"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></radialGradient>
  <radialGradient id="ambient-violet"><stop stop-color="#C084FC" stop-opacity=".13"/><stop offset="1" stop-color="#C084FC" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#64748b" stroke-opacity=".1"/></pattern>
  <clipPath id="background-clip"><rect width="1200" height="${height}" rx="22"/></clipPath>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.heading,.language,.percent,.center-title,.center-detail{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.heading{fill:#f8fafc;font-size:27px;font-weight:800;letter-spacing:2px}
.language{fill:#e2e8f0;font-size:20px;font-weight:700}
.percent{fill:#f8fafc;font-size:19px;font-weight:800}
.center-title{fill:#f8fafc;font-size:23px;font-weight:800}
.center-detail{fill:#a5f3fc;font-size:15px}
.frame{fill:none;stroke:#334155;stroke-opacity:.8}
.ambient-glow{transform-box:fill-box;transform-origin:center;opacity:.36;animation:ambient-drift 26s ease-in-out infinite alternate}
.ambient-violet{animation-delay:-13s}
.slice{transform:rotate(-90deg);transform-origin:174px ${centerY}px;stroke-dasharray:0 ${circumference.toFixed(2)};animation:draw 1.2s cubic-bezier(.2,.8,.2,1) var(--delay) both,pulse 3.2s ease-in-out var(--pulse-delay) infinite;filter:url(#glow)}
.language-row{opacity:0;animation:enter .45s ease-out var(--delay) forwards}
.slice-link,.language-link{cursor:pointer}
.slice-link:hover .slice,.slice-link:focus .slice{stroke-width:40;filter:url(#glow)}
.language-link:hover .language,.language-link:focus .language{fill:#67e8f9;text-decoration:underline}
.language-link:hover .bar,.language-link:focus .bar{filter:url(#glow)}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow .8s cubic-bezier(.2,.8,.2,1) var(--delay) both}
@keyframes draw{to{stroke-dasharray:var(--dash)}}
@keyframes enter{to{opacity:1}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pulse{0%,100%{stroke-opacity:.68}50%{stroke-opacity:1}}
@keyframes ambient-drift{from{transform:translateX(-28px);opacity:.25}to{transform:translateX(28px);opacity:.48}}
@media(prefers-reduced-motion:reduce){.ambient-glow,.slice,.language-row,.bar{animation:none;opacity:1}.ambient-glow{opacity:.36}.slice{stroke-dasharray:var(--dash)}}
</style>
<g clip-path="url(#background-clip)">
  <rect width="1200" height="${height}" rx="22" fill="url(#background)"/>
  <ellipse class="ambient-glow ambient-cyan" cx="275" cy="${centerY - 55}" rx="390" ry="260" fill="url(#ambient-cyan)"/>
  <ellipse class="ambient-glow ambient-violet" cx="930" cy="${centerY + 65}" rx="360" ry="250" fill="url(#ambient-violet)"/>
  <rect x="1" y="1" width="1198" height="${height - 2}" rx="21" fill="url(#grid)"/>
</g>
<rect class="frame" x=".5" y=".5" width="1199" height="${height - 1}" rx="22"/>
<text x="56" y="62" class="heading">MAPA DO CÓDIGO</text>
<text x="1120" y="62" text-anchor="end" class="center-detail">${repositories.length} REPOSITÓRIOS</text>
<circle cx="174" cy="${centerY}" r="106" fill="none" stroke="#1e293b" stroke-width="32"/>
${rings}
<text x="174" y="${centerY - 5}" text-anchor="middle" class="center-title">CÓDIGO</text>
<text x="174" y="${centerY + 22}" text-anchor="middle" class="center-detail">${slices.length} LINGUAGENS</text>
${legend}
</svg>`;

await mkdir("dist", { recursive: true });
await writeFile("dist/github-language-map.svg", svg);
await writeFile(
  "dist/languages.json",
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      repositoryCount: repositories.length,
      totalBytes,
      languages: slices,
    },
    null,
    2,
  ),
);
await writeFile("dist/index.html", await readFile(".github/pages/index.html", "utf8"));
