import { readFile, writeFile } from "node:fs/promises";

const cellSize = 16;
const maxTailLength = 24;
const explosionPause = 6;
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
  const safeRoute = route[0].hasContribution ? [...route].reverse() : route;
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
  const points = route.map((cell) => [cell.x + 6, cell.y + 6]);
  const tailLimit = Math.min(maxTailLength, activeCells);
  const stepTimes = [];
  const tailLengths = [];
  const bursts = [];
  let time = 0;
  let tailLength = 0;

  for (let index = 0; index < route.length; index += 1) {
    stepTimes[index] = time;
    if (route[index].hasContribution) {
      tailLength += 1;
    }
    tailLengths[index] = tailLength;

    if (tailLength === tailLimit) {
      bursts.push({ index, time: time + 0.1, pause: explosionPause });
      tailLength = 0;
      time += explosionPause + 0.1;
    }

    if (index < route.length - 1) {
      time += 1;
    }
  }

  if (bursts.at(-1)?.index !== route.length - 1) {
    bursts.push({
      index: route.length - 1,
      time: time + 0.1,
      pause: explosionPause,
      final: true,
    });
    time += explosionPause + 0.1;
  } else {
    bursts.at(-1).final = true;
  }

  const totalTime = time;
  const percentAt = (value) => Math.min(100, (value / totalTime) * 100).toFixed(4);
  const duration = `${Math.max(45, Math.round(totalTime * 0.16))}s`;
  const pointsAt = (index) => points[Math.max(0, index)];
  const cells = [];
  const eatenCellStyles = [];
  const headFrames = [`0%{transform:translate(${points[0][0]}px,${points[0][1]}px)}`];
  const burstByIndex = new Map(bursts.map((burst) => [burst.index, burst]));
  let eaten = 0;

  for (let index = 0; index < route.length; index += 1) {
    const cell = route[index];
    const point = points[index];
    const stepPercent = percentAt(stepTimes[index]);
    let className = "grid-cell";

    if (cell.hasContribution) {
      eaten += 1;
      className += ` commit-${eaten}`;
      const fadePercent = Math.min(100, Number(stepPercent) + 0.01).toFixed(4);
      eatenCellStyles.push(
        `.commit-${eaten}{animation:consume-${eaten} ${duration} linear infinite}@keyframes consume-${eaten}{0%,${stepPercent}%{opacity:1}${fadePercent}%,99.9999%{opacity:0}100%{opacity:1}}`,
      );
    }
    cells.push(
      `<rect class="${className}" x="${cell.x}" y="${cell.y}" width="12" height="12" rx="2" fill="${cell.fill}"/>`,
    );
    headFrames.push(`${stepPercent}%{transform:translate(${point[0]}px,${point[1]}px)}`);

    const burst = burstByIndex.get(index);
    if (burst) {
      const resumePercent = percentAt(burst.time + burst.pause);
      headFrames.push(`${resumePercent}%{transform:translate(${point[0]}px,${point[1]}px)}`);
    }
  }

  if (eaten !== activeCells) {
    throw new Error(`Not all contribution cells are represented in ${variant.file}`);
  }
  headFrames.push(`100%{transform:translate(${points[0][0]}px,${points[0][1]}px)}`);

  const segmentElements = [];
  const segmentStyles = [];
  for (let segment = 1; segment <= tailLimit; segment += 1) {
    const frames = [`0%{transform:translate(${points[0][0]}px,${points[0][1]}px);opacity:0}`];
    for (let index = 0; index < route.length; index += 1) {
      const visible = tailLengths[index] >= segment;
      const [x, y] = pointsAt(index - (visible ? segment : 0));
      frames.push(
        `${percentAt(stepTimes[index])}%{transform:translate(${x}px,${y}px);opacity:${visible ? 1 : 0}}`,
      );

      const burst = burstByIndex.get(index);
      if (burst) {
        const [resetX, resetY] = points[index];
        frames.push(
          `${percentAt(burst.time + burst.pause)}%{transform:translate(${resetX}px,${resetY}px);opacity:0}`,
        );
      }
    }
    frames.push(`100%{transform:translate(${points[0][0]}px,${points[0][1]}px);opacity:0}`);
    segmentStyles.push(
      `.segment-${segment}{animation:segment-${segment} ${duration} steps(1,end) infinite}@keyframes segment-${segment}{${frames.join("")}}`,
    );
    const color = interpolateColor(gradient, (segment - 1) / Math.max(1, tailLimit - 1));
    segmentElements.push(
      `<rect class="tail-segment segment-${segment}" x="-6" y="-6" width="12" height="12" rx="2" fill="${color}"/>`,
    );
  }

  const visibilityFrames = ["0%{opacity:1}"];
  for (const burst of bursts) {
    const start = percentAt(burst.time);
    const hidden = percentAt(burst.time + 0.01);
    const resume = percentAt(burst.time + burst.pause);
    visibilityFrames.push(
      `${start}%{opacity:1}${hidden}%{opacity:0}${resume}%{opacity:${burst.final ? 0 : 1}}`,
    );
  }
  visibilityFrames.push("100%{opacity:0}");
  const explosionElements = [];
  const explosionStyles = [];
  for (const [burstIndex, burst] of bursts.entries()) {
    const [x, y] = points[burst.index];
    const start = percentAt(burst.time);
    const peak = percentAt(burst.time + burst.pause * 0.35);
    const spread = percentAt(burst.time + burst.pause * 0.75);
    const end = percentAt(burst.time + burst.pause);

    for (let particle = 0; particle < 8; particle += 1) {
      const angle = (Math.PI * 2 * particle) / 8;
      const dx = Math.round(Math.cos(angle) * 14);
      const dy = Math.round(Math.sin(angle) * 14);
      const color = interpolateColor(gradient, particle / 7);
      const name = `burst-${burstIndex}-${particle}`;
      explosionStyles.push(
        `.spark-${name}{animation:${name} ${duration} linear infinite}@keyframes ${name}{0%,${start}%{opacity:0;transform:translate(${x}px,${y}px) scale(.15)}${peak}%{opacity:1;transform:translate(${x}px,${y}px) scale(1)}${spread}%{opacity:1;transform:translate(${x + dx}px,${y + dy}px) scale(1.1)}${end}%,100%{opacity:0;transform:translate(${x + dx}px,${y + dy}px) scale(.2)}}`,
      );
      explosionElements.push(
        `<rect class="spark spark-${name}" x="-3" y="-3" width="6" height="6" rx="1" fill="${color}"/>`,
      );
    }
  }

  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  const clipWidth = columns.length * cellSize;
  const clipHeight = rows.length * cellSize;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Minhoca de olhos abertos que cresce com as contribuições de VniiD</title>
<desc id="description">A cada quadrado ativo, a cauda cresce. A cada 24 segmentos, explode em pixels e continua no mesmo ponto da grade.</desc>
<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="grid-clip"><rect x="2" y="2" width="${clipWidth}" height="${clipHeight}"/></clipPath></defs>
<style>
.grid-cell{shape-rendering:crispEdges}
.worm{animation:worm-visibility ${duration} linear infinite}
.tail-segment{filter:url(#glow);shape-rendering:crispEdges}
.snake-head{transform:translate(${firstPoint[0]}px,${firstPoint[1]}px);filter:url(#glow);animation:crawl ${duration} steps(1,end) infinite}
.spark{filter:url(#glow);shape-rendering:crispEdges}
@keyframes crawl{${headFrames.join("")}}
@keyframes worm-visibility{${visibilityFrames.join("")}}
${eatenCellStyles.join("")}
${segmentStyles.join("")}
${explosionStyles.join("")}
@media(prefers-reduced-motion:reduce){.worm,.tail-segment,.snake-head,.spark,.grid-cell{animation:none}}
</style>
<rect width="${width}" height="${height}" fill="${variant.emptyColor}"/>
${cells.join("")}
<g class="worm">${segmentElements.join("")}<g class="snake-head"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="${gradient[0]}" stroke="${gradient[1]}" stroke-width="1.5"/><circle cx="-2.5" cy="-2" r="1.35" fill="#f8fafc"/><circle cx="2.5" cy="-2" r="1.35" fill="#f8fafc"/><circle cx="-2.5" cy="-2" r=".55" fill="#0b1220"/><circle cx="2.5" cy="-2" r=".55" fill="#0b1220"/></g></g>
<g class="explosions" aria-hidden="true" clip-path="url(#grid-clip)">${explosionElements.join("")}</g>
<desc>Grade percorrida da posição ${firstPoint[0]},${firstPoint[1]} até ${lastPoint[0]},${lastPoint[1]}.</desc>
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
