#!/usr/bin/env node
// Normalise a generated image into a Runtime Asset of the height the game
// decided. Generation settles how a figure looks; this script settles how tall
// it is, by cropping to the alpha bounding box and rescaling, so that approving
// artwork is never a negotiation with the generator.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

const usage = [
  "Usage: normalise-runtime-asset.mjs --input <png> --output <png> --target-height <px>",
  "                                   [--register <assets.md> --asset <name>]",
].join("\n");

const columns = [
  "Asset", "Declared size", "Target height",
  "Measured height", "Measured width", "Visual Anchor x", "File",
];
// Declared size is the author's, in the author's own world unit; every other
// cell is the script's. An empty cell is written as an em dash so that a row
// initialised before fabrication reads as pending rather than as zero.
const pending = "\u2014";
const preamble = [
  "# Asset register",
  "",
  "One row per Runtime Asset the game needs. `Declared size` is decided before",
  "fabrication and written by hand; every measured column is written by",
  "`normalise-runtime-asset.mjs` from the finished image and never by hand.",
  "`Visual Anchor x` is the centre of the asset's lowest opaque row, in pixels",
  "from its left edge: where the asset meets its Ground Point.",
  "",
];

function row(cells) {
  return `| ${cells.join(" | ")} |`;
}

// The register is Markdown a human reads, so it is edited as lines rather than
// parsed into a model and reprinted: whatever else the author wrote around the
// table survives untouched.
function register(path, asset, measurements) {
  const cells = [
    measurements.targetHeight, measurements.height, measurements.width,
    measurements.visualAnchorX, measurements.file,
  ];
  const lines = existsSync(path) ? readFileSync(path, "utf8").split("\n") : [];
  const header = lines.findIndex((line) => line.startsWith(`| ${columns[0]} |`));
  if (header === -1) {
    const body = lines.length > 0 ? lines : preamble;
    while (body.at(-1) === "") body.pop();
    writeFileSync(path, [
      ...body, "",
      row(columns), row(columns.map(() => "---")), row([asset, pending, ...cells]), "",
    ].join("\n"));
    return;
  }
  let end = header + 2;
  while (lines[end]?.startsWith("|")) end += 1;
  const existing = lines.slice(header, end).findIndex((line) => line.split("|")[1]?.trim() === asset) + header;
  if (existing < header) {
    lines.splice(end, 0, row([asset, pending, ...cells]));
  } else {
    const declared = lines[existing].split("|")[2]?.trim() ?? pending;
    lines[existing] = row([asset, declared, ...cells]);
  }
  writeFileSync(path, lines.join("\n"));
}

function magick(args) {
  try {
    return execFileSync("magick", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (failure) {
    // ImageMagick warns on stderr about an empty bounding box, which is an
    // answer this script expects and handles, so stderr is captured rather
    // than inherited and only surfaces when the command genuinely fails.
    if (failure.code === "ENOENT") throw new Error("ImageMagick is not installed: the `magick` command is required.");
    throw new Error(`magick failed: ${String(failure.stderr ?? failure.message).trim()}`);
  }
}

// The bounding box of the opaque pixels, which is what the game measures — the
// canvas is padding the generator chose and carries no meaning. ImageMagick
// computes a trim box against the corner pixel, so a figure that reaches a
// corner would invert the result; the black border makes the corner read as
// transparent whatever the image does.
function boundingBox(path, region) {
  const box = magick([
    path, "-alpha", "extract", "-threshold", "0",
    ...(region ? ["-crop", region, "+repage"] : []),
    "-bordercolor", "black", "-border", "1",
    "-format", "%@", "info:",
  ]).trim();
  const [, width, height, x, y] = box.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/) ?? [];
  if (width === undefined) throw new Error(`ImageMagick reported an unreadable bounding box: ${box}`);
  return { width: Number(width), height: Number(height), x: Number(x) - 1, y: Number(y) - 1 };
}

// Height, width, and the Visual Anchor's horizontal offset: the centre of the
// asset's lowest opaque row, which is where the asset meets its Ground Point
// and which is not the centre of the box for a figure that leans.
function measure(path) {
  const box = boundingBox(path);
  if (box.width === 0 || box.height === 0) {
    throw new Error(`${path} has no opaque pixels: nothing to measure or normalise.`);
  }
  const floor = boundingBox(path, `${box.width}x1+${box.x}+${box.y + box.height - 1}`);
  return { ...box, visualAnchorX: floor.x + Math.round((floor.width - 1) / 2) };
}

function normalise({ input, output, targetHeight }) {
  if (!existsSync(input)) throw new Error(`No such input image: ${input}`);
  const source = measure(input);
  const width = Math.max(1, Math.round((source.width * targetHeight) / source.height));
  magick([
    input,
    "-crop", `${source.width}x${source.height}+${source.x}+${source.y}`, "+repage",
    "-resize", `${width}x${targetHeight}!`,
    "-strip", output,
  ]);
  // Measure the result rather than assume it: a declared number nobody checked
  // is the defect this script exists to remove.
  return measure(output);
}

function parse(argv) {
  const known = ["input", "output", "target-height", "register", "asset"];
  const flags = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index].startsWith("--") ? argv[index].slice(2) : "";
    if (!known.includes(name)) throw new Error(`Unrecognised argument: ${argv[index]}\n${usage}`);
    if (argv[index + 1] === undefined || argv[index + 1].startsWith("--")) {
      throw new Error(`${argv[index]} needs a value\n${usage}`);
    }
    flags.set(name, argv[index + 1]);
  }
  const targetHeight = Number(flags.get("target-height"));
  if (!flags.get("input") || !flags.get("output")) throw new Error(usage);
  if (!Number.isInteger(targetHeight) || targetHeight < 1) {
    throw new Error(`--target-height must be a whole number of pixels: ${flags.get("target-height")}`);
  }
  if (Boolean(flags.get("register")) !== Boolean(flags.get("asset"))) {
    throw new Error("--register and --asset are given together: the register needs a name for the row.");
  }
  return {
    input: flags.get("input"),
    output: flags.get("output"),
    targetHeight,
    registerPath: flags.get("register"),
    asset: flags.get("asset"),
  };
}

try {
  const options = parse(process.argv.slice(2));
  const measured = normalise(options);
  if (options.registerPath) {
    register(options.registerPath, options.asset, {
      ...measured,
      targetHeight: options.targetHeight,
      file: relative(dirname(options.registerPath), options.output),
    });
  }
  process.stdout.write([
    `Normalised ${options.input} -> ${options.output}`,
    `  measured height: ${measured.height}`,
    `  measured width: ${measured.width}`,
    `  visual anchor x: ${measured.visualAnchorX}`,
    "",
  ].join("\n"));
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
