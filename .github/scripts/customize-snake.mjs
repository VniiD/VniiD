import { readFile, writeFile } from "node:fs/promises";

const cellSize = 16;
const variants = [
  {
    file: "dist/github-contribution-grid-snake.svg",
    emptyColor: "#EBEDF0",
  },
  {
    file: "dist/github-contribution-grid-snake-dark.svg",
    emptyColor: "#161B22",
  },
];

function getAttribute(attributes, name) {
  return attributes.match(new RegExp(`${name}="([^"]+)"`))?.[1];
}

function interpolateColor(colors, ratio) {
  const scaled = ratio * (colors.length - 1);
  const start = Math.floor(scaled);
  const end = Math.min(start + 1, colors.length - 1);
  const blend = scaled - start;
  const channels = [1, 3, 5].map((offset) => {
    const first = Number.parseInt(colors[start].slice(offset, offset + 2), 16);
    const second = Number.parseInt(colors[end].slice(offset, offset + 2), 16);
    return Math.round(first + (second - first) * blend)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function getBrightness(color) {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(color.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function getGrid(svg, variant) {
  const style = svg.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if (!style) {
    throw new Error(`Contribution grid styles were not found in ${variant.file}`);
  }

  const colors = Object.fromEntries(
    [...style.matchAll(/--(c[0-4]|ce):(#[0-9a-fA-F]{6})/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
  const gradient = ["c1", "c2", "c3", "c4"]
    .map((key) => colors[key])
    .filter(Boolean)
    .sort((a, b) => getBrightness(a) - getBrightness(b));
  if (gradient.length !== 4) {
    throw new Error(`Contribution palette is incomplete in ${variant.file}`);
  }

  const colorClasses = new Map(
    [...style.matchAll(/\.c\.(c[a-z0-9]+)\{fill:var\(--(c[0-4])\)/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
  const cells = [...svg.matchAll(/<rect\b([^>]*)\/>/g)]
    .map((match) => {
      const attributes = match[1];
      const classes = getAttribute(attributes, "class")?.split(" ");
      if (classes?.[0] !== "c") {
        return null;
      }

      const x = Number(getAttribute(attributes, "x"));
      const y = Number(getAttribute(attributes, "y"));
      const level = classes[1];
      const colorVariable = level ? colorClasses.get(level) : "ce";
      const fill = colorVariable && colors[colorVariable];

      if (!Number.isFinite(x) || !Number.isFinite(y) || !fill) {
        throw new Error(`Invalid contribution cell in ${variant.file}`);
      }

      return { x, y, fill, hasContribution: Boolean(level) };
    })
    .filter((cell) => cell !== null);

  if (cells.length < 300) {
    throw new Error(`Contribution grid is incomplete in ${variant.file}`);
  }

  const columns = [...new Set(cells.map((cell) => cell.x))].sort((a, b) => a - b);
  const rows = [...new Set(cells.map((cell) => cell.y))].sort((a, b) => a - b);
  if (cells.length > columns.length * rows.length || rows.length !== 7) {
    throw new Error(`Unexpected contribution grid dimensions in ${variant.file}`);
  }

  const byPosition = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));
  const route = rows.flatMap((y, rowIndex) => {
    const orderedColumns = rowIndex % 2 === 0 ? columns : [...columns].reverse();
    return orderedColumns.map(
      (x) => byPosition.get(`${x},${y}`) ?? { x, y, fill: colors.ce, hasContribution: false },
    );
  });
  const reversedRoute = [...route].reverse();
  const safeRoute = route[0].hasContribution ? reversedRoute : route;
  if (safeRoute[0].hasContribution) {
    throw new Error(`Snake needs an empty starting square in ${variant.file}`);
  }

  for (let index = 1; index < safeRoute.length; index += 1) {
    const distance =
      Math.abs(safeRoute[index].x - safeRoute[index - 1].x) +
      Math.abs(safeRoute[index].y - safeRoute[index - 1].y);
    if (distance !== cellSize) {
      throw new Error(`Snake route leaves the contribution grid in ${variant.file}`);
    }
  }

  return {
    route: safeRoute,
    columns,
    rows,
    gradient,
    activeCells: cells.filter((cell) => cell.hasContribution).length,
  };
}

function createSnakeSvg(grid, variant) {
  const { route, columns, rows, activeCells, gradient } = grid;
  const width = columns.at(-1) + 14;
  const height = rows.at(-1) + 14;
  const head = gradient.at(-1);
  const glow = gradient.at(-2);
  const points = route.map((cell) => [cell.x + 6, cell.y + 6]);
  const cells = route
    .map(
      (cell) =>
        `<rect x="${cell.x}" y="${cell.y}" width="12" height="12" rx="2" fill="${cell.fill}"/>`,
    )
    .join("");
  const duration = `${Math.max(45, Math.round(route.length * 0.16))}s`;
  const headFrames = [];
  const growthSteps = [];
  let eaten = 0;

  for (let index = 0; index < route.length; index += 1) {
    if (route[index].hasContribution) {
      eaten += 1;
      growthSteps.push(index);
    }

    const [x, y] = points[index];
    const percent = ((index / route.length) * 100).toFixed(4);
    headFrames.push(`${percent}%{transform:translate(${x}px,${y}px)}`);
  }

  if (eaten !== activeCells) {
    throw new Error(`Not all contribution cells are represented in ${variant.file}`);
  }

  const segments = [];
  const segmentAnimations = [];
  for (let segment = 1; segment <= activeCells; segment += 1) {
    const firstStep = growthSteps[segment - 1];
    const segmentFrames = [
      `0%{transform:translate(${points[0][0]}px,${points[0][1]}px);opacity:0}`,
    ];

    for (let index = firstStep; index < route.length; index += 1) {
      const [x, y] = points[index - segment];
      const percent = ((index / route.length) * 100).toFixed(4);
      segmentFrames.push(`${percent}%{transform:translate(${x}px,${y}px);opacity:1}`);
    }

    segmentFrames.push(`100%{opacity:0}`);
    segmentAnimations.push(
      `.segment-${segment}{animation:segment-${segment} ${duration} steps(1,end) infinite}@keyframes segment-${segment}{${segmentFrames.join("")}}`,
    );
    const color = interpolateColor(gradient, (segment - 1) / Math.max(1, activeCells - 1));
    segments.push(
      `<rect class="tail-segment segment-${segment}" x="-6" y="-6" width="12" height="12" rx="2" fill="${color}"/>`,
    );
  }

  const headAnimation = `@keyframes crawl{${headFrames.join("")}100%{transform:translate(${points[0][0]}px,${points[0][1]}px)}}`;
  const firstPoint = points[0];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Minhoca que cresce com as contribuições de VniiD</title>
<desc id="description">A cabeça percorre a grade e acrescenta um quadrado à cauda para cada célula com contribuições.</desc>
<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<style>
.worm{animation:reset ${duration} linear infinite}
.tail-segment{filter:url(#glow);shape-rendering:crispEdges}
.snake-head{transform:translate(${firstPoint[0]}px,${firstPoint[1]}px);filter:url(#glow);animation:crawl ${duration} steps(1,end) infinite}
${headAnimation}
@keyframes reset{0%,1%{opacity:0}2%,96%{opacity:1}100%{opacity:0}}
${segmentAnimations.join("")}
@media(prefers-reduced-motion:reduce){.worm,.tail-segment,.snake-head{animation:none}}
</style>
<rect width="${width}" height="${height}" fill="${variant.emptyColor}"/>
${cells}
<g class="worm">${segments.join("")}<g class="snake-head"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="${head}" stroke="${glow}" stroke-width="1.5"/></g></g>
</svg>`;
}

let expectedActiveCells;

for (const variant of variants) {
  const source = await readFile(variant.file, "utf8");
  const grid = getGrid(source, variant);
  if (grid.activeCells === 0) {
    throw new Error(`No contribution squares found in ${variant.file}`);
  }
  if (expectedActiveCells !== undefined && grid.activeCells !== expectedActiveCells) {
    throw new Error("Light and dark contribution grids do not match");
  }

  expectedActiveCells = grid.activeCells;
  await writeFile(variant.file, createSnakeSvg(grid, variant));
}
