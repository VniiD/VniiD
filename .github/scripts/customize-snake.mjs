import { readFile, writeFile } from "node:fs/promises";

const cellSize = 16;
const maxBodyLength = 24;
const maxTailLength = maxBodyLength - 1;
const blinkCount = 3;
const blinkHalfPeriod = 0.6;
const blinkDuration = blinkCount * blinkHalfPeriod * 2;
const explosionPause = 6;
const variants = [
  {
    file: "dist/github-contribution-grid-snake.svg",
    backgroundColor: "#080D18",
    emptyColor: "#101827",
    gridLineColor: "#2B3A50",
  },
  {
    file: "dist/github-contribution-grid-snake-dark.svg",
    backgroundColor: "#080D18",
    emptyColor: "#101827",
    gridLineColor: "#2B3A50",
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
  const canvasPadding = 16;
  const width = columns.at(-1) + 14 + canvasPadding * 2;
  const height = rows.at(-1) + 14 + canvasPadding * 2;
  const points = route.map((cell) => [
    cell.x + 6 + canvasPadding,
    cell.y + 6 + canvasPadding,
  ]);
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
      bursts.push({
        index,
        blinkStart: time + 0.1,
        time: time + blinkDuration + 0.1,
        pause: explosionPause,
        segments: tailLength,
      });
      tailLength = 0;
      time += blinkDuration + explosionPause + 0.1;
    }

    if (index < route.length - 1) {
      time += 1;
    }
  }

  if (bursts.at(-1)?.index !== route.length - 1) {
    bursts.push({
      index: route.length - 1,
      blinkStart: time + 0.1,
      time: time + blinkDuration + 0.1,
      pause: explosionPause,
      segments: tailLengths.at(-1),
      final: true,
    });
    time += blinkDuration + explosionPause + 0.1;
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
      `<rect class="${className}" x="${cell.x + canvasPadding}" y="${cell.y + canvasPadding}" width="12" height="12" rx="2" fill="${cell.hasContribution ? cell.fill : variant.emptyColor}" stroke="${cell.hasContribution ? "none" : variant.gridLineColor}" stroke-width="1" stroke-opacity=".9"/>`,
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
    const tailPosition = (segment - 1) / Math.max(1, tailLimit - 1);
    const color = interpolateColor(gradient, 1 - tailPosition);
    const opacity = 1 - tailPosition;
    segmentElements.push(
      `<rect class="tail-segment segment-${segment}" x="-6" y="-6" width="12" height="12" rx="2" fill="${color}" fill-opacity="${opacity.toFixed(2)}"/>`,
    );
  }

  const visibilityFrames = ["0%{opacity:1}"];
  for (const burst of bursts) {
    const blinkStart = percentAt(burst.blinkStart);
    visibilityFrames.push(`${blinkStart}%{opacity:1}`);
    for (let blink = 0; blink < blinkCount; blink += 1) {
      const blinkStartTime =
        burst.blinkStart + blink * blinkHalfPeriod * 2;
      const dim = percentAt(blinkStartTime + blinkHalfPeriod);
      const bright = percentAt(blinkStartTime + blinkHalfPeriod * 2);
      visibilityFrames.push(`${dim}%{opacity:.12}${bright}%{opacity:1}`);
    }

    visibilityFrames.push(
      `${percentAt(burst.blinkStart + 0.15)}%{opacity:1}${percentAt(burst.time - 0.08)}%{opacity:.18}`,
    );
    const start = percentAt(burst.time);
    const hidden = percentAt(burst.time + 0.01);
    const resumeHold = percentAt(burst.time + burst.pause - 0.01);
    const resume = percentAt(burst.time + burst.pause);
    visibilityFrames.push(
      `${start}%{opacity:1}${hidden}%{opacity:0}${resumeHold}%{opacity:0}${resume}%{opacity:${burst.final ? 0 : 1}}`,
    );
  }
  visibilityFrames.push("100%{opacity:0}");
  const explosionElements = [];
  const explosionStyles = [];
  const coilElements = [];
  for (const [burstIndex, burst] of bursts.entries()) {
    const fragmentCount = burst.segments + 1;
    const start = percentAt(burst.time);
    const reveal = percentAt(burst.time + 0.05);
    const spread = percentAt(burst.time + burst.pause * 0.12);
    const fade = percentAt(burst.time + burst.pause * 0.56);
    const end = percentAt(burst.time + burst.pause * 0.68);
    const [centerX, centerY] = points[burst.index];
    const coreName = `burst-${burstIndex}-core`;
    const coilName = `burst-${burstIndex}-coil`;
    const coilStartTime = burst.blinkStart + 0.15;
    const coilFinishTime = burst.time - 0.08;
    const coilPathPoints = [];
    for (let point = 0; point <= 96; point += 1) {
      const progress = point / 96;
      const angle = progress * Math.PI * 2 * 3;
      const radius = 43 - progress * 39;
      const x = (centerX + Math.cos(angle) * radius).toFixed(2);
      const y = (centerY + Math.sin(angle) * radius).toFixed(2);
      coilPathPoints.push(`${point === 0 ? "M" : "L"}${x} ${y}`);
    }
    explosionStyles.push(
      `.coil-${coilName}{animation:${coilName} ${duration} linear infinite;transform-box:fill-box;transform-origin:center}@keyframes ${coilName}{0%,${percentAt(coilStartTime)}%{opacity:0;stroke-dashoffset:1000;transform:rotate(0deg) scale(1.2)}${percentAt(coilStartTime + 0.02)}%{opacity:.9;stroke-dashoffset:1000}${percentAt(coilFinishTime)}%{opacity:1;stroke-dashoffset:0;transform:rotate(720deg) scale(.8)}${start}%,100%{opacity:0;stroke-dashoffset:0;transform:rotate(900deg) scale(.2)}}`,
    );
    coilElements.push(
      `<path class="coil coil-${coilName}" d="${coilPathPoints.join(" ")}" pathLength="1000"/>`,
    );
    const shockName = `burst-${burstIndex}-shockwave`;
    explosionStyles.push(
      `.shockwave-${shockName}{animation:${shockName} ${duration} ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes ${shockName}{0%,${start}%{opacity:0;transform:scale(.1)}${reveal}%{opacity:.95;transform:scale(.2)}${spread}%{opacity:.65;transform:scale(1.4)}${fade}%{opacity:.18;transform:scale(2.4)}${end}%,100%{opacity:0;transform:scale(3.2)}}`,
    );
    explosionElements.push(
      `<circle class="shockwave shockwave-${shockName}" cx="${centerX}" cy="${centerY}" r="22" fill="none" stroke="${gradient.at(-1)}" stroke-width="3"/>`,
    );
    explosionStyles.push(
      `.spark-${coreName}{animation:${coreName} ${duration} linear infinite}@keyframes ${coreName}{0%,${start}%{opacity:0;transform:translate(${centerX}px,${centerY}px) scale(.1)}${reveal}%{opacity:1;transform:translate(${centerX}px,${centerY}px) scale(.7)}${spread}%{opacity:.9;transform:translate(${centerX}px,${centerY}px) scale(2.4)}${fade}%,${end}%,100%{opacity:0;transform:translate(${centerX}px,${centerY}px) scale(3.2)}}`,
    );
    explosionElements.push(
      `<circle class="spark spark-${coreName}" cx="0" cy="0" r="8" fill="${gradient.at(-1)}" fill-opacity=".85"/>`,
    );

    for (let fragment = 0; fragment < fragmentCount; fragment += 1) {
      const segment = fragment;
      const angle = (Math.PI * 2 * fragment) / fragmentCount - Math.PI / 2;
      const distance = 42 + (fragment % 3) * 12;
      const dx = Math.round(Math.cos(angle) * distance);
      const dy = Math.round(Math.sin(angle) * distance);
      const tailPosition = segment === 0
        ? 0
        : (segment - 1) / Math.max(1, tailLimit - 1);
      const color = interpolateColor(gradient, 1 - tailPosition);
      const opacity = 1 - tailPosition;
      const name = `burst-${burstIndex}-segment-${segment}`;
      explosionStyles.push(
        `.spark-${name}{animation:${name} ${duration} cubic-bezier(.12,.75,.22,1) infinite}@keyframes ${name}{0%,${start}%{opacity:0;transform:translate(${centerX}px,${centerY}px) scale(.12)}${reveal}%{opacity:1;transform:translate(${centerX}px,${centerY}px) scale(.65)}${spread}%{opacity:1;transform:translate(${centerX + dx}px,${centerY + dy}px) scale(1.25)}${fade}%{opacity:.65;transform:translate(${centerX + dx * 1.16}px,${centerY + dy * 1.16}px) scale(.8)}${end}%,100%{opacity:0;transform:translate(${centerX + dx * 1.25}px,${centerY + dy * 1.25}px) scale(.15)}}`,
      );
      explosionElements.push(
        `<rect class="spark spark-${name}" x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="${color}" fill-opacity="${opacity.toFixed(2)}"/>`,
      );
    }
  }

  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Minhoca pixel-art que cresce com as contribuições de VniiD</title>
<desc id="description">Sobre uma grade escura quadriculada, a minhoca percorre as contribuições. A cauda vai do claro ao escuro e desaparece na ponta. Ao chegar a 24 blocos, ela se enrola, pisca e explode em partículas radiais, continuando na grade.</desc>
<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="neon-coil" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22D3EE"/><stop offset=".5" stop-color="#818CF8"/><stop offset="1" stop-color="#F472B6"/></linearGradient><pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#64748b" stroke-opacity=".12" stroke-width=".7"/></pattern><clipPath id="grid-clip"><rect width="${width}" height="${height}"/></clipPath></defs>
<style>
.grid-cell{shape-rendering:crispEdges}
.worm{animation:worm-visibility ${duration} linear infinite}
.tail-segment{filter:url(#glow);shape-rendering:crispEdges}
.snake-head{transform:translate(${firstPoint[0]}px,${firstPoint[1]}px);filter:url(#glow);animation:crawl ${duration} steps(1,end) infinite}
.spark{filter:url(#glow);shape-rendering:crispEdges}
.coil{fill:none;stroke:url(#neon-coil);stroke-width:6;stroke-linecap:round;stroke-dasharray:1000;stroke-dashoffset:1000;filter:url(#glow)}
.shockwave{filter:url(#glow)}
@keyframes crawl{${headFrames.join("")}}
@keyframes worm-visibility{${visibilityFrames.join("")}}
${eatenCellStyles.join("")}
${segmentStyles.join("")}
${explosionStyles.join("")}
@media(prefers-reduced-motion:reduce){.worm,.tail-segment,.snake-head,.grid-cell{animation:none}.coil,.shockwave,.spark{display:none}}
</style>
<rect width="${width}" height="${height}" fill="${variant.backgroundColor}"/>
<rect width="${width}" height="${height}" fill="url(#checker)"/>
${cells.join("")}
<g class="worm">${segmentElements.join("")}<g class="snake-head"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="${gradient.at(-1)}" stroke="${gradient.at(-2)}" stroke-width="1.5"/></g></g>
<g class="coils" aria-hidden="true" clip-path="url(#grid-clip)">${coilElements.join("")}</g>
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
