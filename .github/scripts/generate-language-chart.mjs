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
  C: "#A8B9CC",
  "C#": "#9B4F96",
  Go: "#00ADD8",
  Java: "#F89820",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Rust: "#DEA584",
  TypeScript: "#3178C6",
  Outros: "#94A3B8",
};
const palette = ["#22D3EE", "#818CF8", "#F472B6", "#34D399", "#FBBF24", "#94A3B8"];
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
const legend = slices.map((slice, index) => {
  const y = firstRowY + index * rowHeight;
  const percent = `${(slice.ratio * 100).toFixed(1)}%`;
  return `<g class="language-row row-${index}" style="--delay:${index * 100}ms">
  <circle cx="365" cy="${y - 6}" r="7" fill="${slice.color}"/>
  <text x="384" y="${y}" class="language">${escapeXml(slice.language)}</text>
  <text x="1120" y="${y}" text-anchor="end" class="percent">${percent}</text>
  <rect x="365" y="${y + 10}" width="${barWidth}" height="9" rx="4.5" fill="#1e293b"/>
  <rect class="bar" x="365" y="${y + 10}" width="${(slice.ratio * barWidth).toFixed(2)}" height="9" rx="4.5" fill="${slice.color}"/>
</g>`;
}).join("");
const rings = slices.map((slice, index) =>
  `<circle class="slice slice-${index}" cx="174" cy="${centerY}" r="${chartRadius}" fill="none" stroke="${slice.color}" stroke-width="32" stroke-dasharray="${slice.dash}" stroke-dashoffset="-${slice.offset}" pathLength="${circumference.toFixed(2)}" style="--dash:${slice.dash};--delay:${index * 100}ms"><title>${escapeXml(slice.language)} · ${(slice.ratio * 100).toFixed(1)}%</title></circle>`,
).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title description">
<title id="title">Mapa animado do código de ${username}</title>
<desc id="description">Gráfico animado com a distribuição das linguagens nos repositórios públicos.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08111f"/><stop offset="1" stop-color="#101d2d"/></linearGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#64748b" stroke-opacity=".1"/></pattern>
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
.slice{transform:rotate(-90deg);transform-origin:174px ${centerY}px;stroke-dasharray:0 ${circumference.toFixed(2)};animation:draw 1.2s cubic-bezier(.2,.8,.2,1) var(--delay) both;filter:url(#glow)}
.language-row{opacity:0;animation:enter .45s ease-out var(--delay) forwards}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow .8s cubic-bezier(.2,.8,.2,1) var(--delay) both}
@keyframes draw{to{stroke-dasharray:var(--dash)}}
@keyframes enter{to{opacity:1}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media(prefers-reduced-motion:reduce){.slice,.language-row,.bar{animation:none;opacity:1}}
</style>
<rect width="1200" height="${height}" rx="22" fill="url(#background)"/>
<rect x="1" y="1" width="1198" height="${height - 2}" rx="21" fill="url(#grid)"/>
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
