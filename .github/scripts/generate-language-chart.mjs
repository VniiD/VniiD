import { mkdir, writeFile } from "node:fs/promises";

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
  let url = `https://api.github.com/users/${username}/repos?type=owner&per_page=100&sort=pushed`;

  while (url) {
    const result = await fetchJson(url);
    repositories.push(...result.body);
    url = result.link?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? "";
  }

  return repositories.filter((repo) => !repo.fork && !repo.archived && repo.name !== username);
}

const repositories = await getRepositories();
const languageData = await Promise.all(
  repositories.map(async (repo) => {
    const { body } = await fetchJson(repo.languages_url);
    return body;
  }),
);
const totals = new Map();

for (const repositoryLanguages of languageData) {
  for (const [language, bytes] of Object.entries(repositoryLanguages)) {
    totals.set(language, (totals.get(language) ?? 0) + bytes);
  }
}

const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
if (sorted.length === 0) {
  throw new Error("No public repository language data was returned");
}

const top = sorted.slice(0, 5);
const remainder = sorted.slice(5).reduce((sum, [, bytes]) => sum + bytes, 0);
if (remainder > 0) {
  top.push(["Outros", remainder]);
}

const totalBytes = top.reduce((sum, [, bytes]) => sum + bytes, 0);
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
const circumference = 2 * Math.PI * 58;
let offset = 0;
const slices = top.map(([language, bytes], index) => {
  const ratio = bytes / totalBytes;
  const length = ratio * circumference;
  const color = colors[language] ?? palette[index % palette.length];
  const currentOffset = offset;
  offset += length;

  return {
    language,
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

const legend = slices.map((slice, index) => {
  const y = 46 + index * 22;
  const percent = `${(slice.ratio * 100).toFixed(1)}%`;
  return `<g><circle cx="238" cy="${y - 4}" r="5" fill="${slice.color}"/><text x="252" y="${y}" class="label">${escapeXml(slice.language)}</text><text x="420" y="${y}" text-anchor="end" class="value">${percent}</text></g>`;
}).join("");
const rings = slices.map((slice, index) =>
  `<circle class="slice slice-${index}" cx="104" cy="104" r="58" fill="none" stroke="${slice.color}" stroke-width="24" stroke-dasharray="${slice.dash}" stroke-dashoffset="-${slice.offset}" pathLength="${circumference.toFixed(2)}" style="--dash:${slice.dash}"/>`,
).join("");
const animationDelays = slices.map((_, index) =>
  `.slice-${index}{animation-delay:${index * 100}ms}`,
).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="208" viewBox="0 0 480 208" role="img" aria-labelledby="title description">
<title id="title">Linguagens dos repositórios públicos de ${username}</title>
<desc id="description">Distribuição calculada a partir dos bytes de código reportados pela API de linguagens do GitHub.</desc>
<style>
.label,.value,.center-title,.center-subtitle{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.label{fill:#cbd5e1;font-size:13px}.value{fill:#f8fafc;font-size:13px;font-weight:700}
.center-title{fill:#f8fafc;font-size:14px;font-weight:700}.center-subtitle{fill:#94a3b8;font-size:10px}
.slice{transform:rotate(-90deg);transform-origin:104px 104px;stroke-dasharray:0 ${circumference.toFixed(2)};animation:draw 1.15s cubic-bezier(.2,.8,.2,1) both}
@keyframes draw{to{stroke-dasharray:var(--dash);opacity:1}}
${animationDelays}
@media(prefers-reduced-motion:reduce){.slice{animation:none}}
</style>
<rect width="480" height="208" rx="18" fill="#0b1220"/>
<circle cx="104" cy="104" r="58" fill="none" stroke="#1e293b" stroke-width="24"/>
${rings}
<text x="104" y="100" text-anchor="middle" class="center-title">GitHub</text>
<text x="104" y="118" text-anchor="middle" class="center-subtitle">linguagens</text>
${legend}
<text x="238" y="190" class="center-subtitle">Bytes de código em ${repositories.length} repositórios públicos</text>
</svg>`;

await mkdir("dist", { recursive: true });
await writeFile("dist/github-language-donut.svg", svg);
