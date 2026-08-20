import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = join(import.meta.dirname, "normalise-runtime-asset.mjs");

// The tests drive the command line and nothing else, on PNGs they draw
// themselves, so no fixture file can drift away from what it is meant to show.
function withWorkspace(body) {
  const directory = mkdtempSync(join(tmpdir(), "normalise-runtime-asset-"));
  const files = {
    path: (name) => join(directory, name),
    // A figure is drawn as filled rectangles on a transparent canvas: those
    // coordinates are the truth the assertions are written against.
    draw: (name, size, ...rectangles) => execFileSync("magick", [
      "-size", size, "xc:none", "-fill", "red",
      ...rectangles.flatMap((rectangle) => ["-draw", `rectangle ${rectangle}`]),
      join(directory, name),
    ]),
    canvas: (name) => execFileSync("magick", [join(directory, name), "-format", "%w %h", "info:"], { encoding: "utf8" })
      .split(" ").map(Number),
    read: (name) => readFileSync(join(directory, name), "utf8"),
    write: (name, contents) => writeFileSync(join(directory, name), contents),
    // Every case normalises the same input under the same two names, so only
    // the target height and the register flags vary between them.
    normalise: (targetHeight, ...register) => execFileSync(process.execPath, [
      script,
      "--input", join(directory, "in.png"),
      "--output", join(directory, "out.png"),
      "--target-height", String(targetHeight),
      ...register,
    ], { encoding: "utf8" }),
  };
  try {
    body(files);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function reported(output) {
  return Object.fromEntries(
    output.split("\n").flatMap((line) => {
      const match = line.match(/^\s*([a-z ]+): (-?\d+)$/);
      return match ? [[match[1].trim(), Number(match[2])]] : [];
    }),
  );
}

// The register rows the assertions read: the asset name and the cells after it.
function rows(register) {
  return register.split("\n")
    .filter((line) => /^\| [a-z]/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
}

test("rescales a figure with symmetric padding to exactly the target height", () => {
  withWorkspace((files) => {
    // A 100x140 figure centred on a 200x200 canvas.
    files.draw("in.png", "200x200", "50,30 149,169");
    const output = files.normalise(70);
    assert.deepEqual(files.canvas("out.png"), [50, 70]);
    assert.equal(reported(output)["measured height"], 70);
  });
});

test("measures the figure, not the canvas, when the padding is asymmetric", () => {
  withWorkspace((files) => {
    // A 120x160 figure at +40+20 on a 300x400 canvas, standing on a 40-wide
    // foot whose centre is 40px from the figure's left edge, not 60.
    files.draw("in.png", "300x400", "40,20 159,119", "60,120 99,179");
    const output = files.normalise(80);
    assert.deepEqual(reported(output), { "measured height": 80, "measured width": 60, "visual anchor x": 20 });
  });
});

test("puts the Visual Anchor on the centre of a single-pixel contact", () => {
  withWorkspace((files) => {
    // A 20x25 figure at +10+10 on a 40x40 canvas, resting on one pixel five
    // columns in from its left edge.
    files.draw("in.png", "40x40", "10,10 29,29", "15,30 15,34");
    const output = files.normalise(25);
    assert.deepEqual(reported(output), { "measured height": 25, "measured width": 20, "visual anchor x": 5 });
  });
});

test("normalises a figure that touches all four edges of its canvas", () => {
  withWorkspace((files) => {
    files.draw("in.png", "150x100", "0,0 149,99");
    const output = files.normalise(50);
    assert.deepEqual(files.canvas("out.png"), [75, 50]);
    assert.equal(reported(output)["measured height"], 50);
  });
});

test("enlarges a figure whose target is taller than its source", () => {
  withWorkspace((files) => {
    files.draw("in.png", "80x80", "20,30 59,69");
    const output = files.normalise(120);
    assert.deepEqual(files.canvas("out.png"), [120, 120]);
    assert.equal(reported(output)["measured height"], 120);
  });
});

test("refuses a fully transparent image instead of reporting a degenerate box", () => {
  withWorkspace((files) => {
    files.draw("in.png", "64x64");
    assert.throws(
      () => files.normalise(40),
      (error) => /no opaque pixels/.test(String(error.stderr)),
    );
  });
});

test("writes one register row per asset, declared and measured values apart", () => {
  withWorkspace((files) => {
    files.draw("in.png", "200x200", "50,30 149,169");
    files.normalise(70, "--register", files.path("assets.md"), "--asset", "michele");
    const register = files.read("assets.md");
    assert.match(register, /\| Asset \| Declared size \| Target height \| Measured height \| Measured width \| Visual Anchor x \| File \|/);
    assert.deepEqual(rows(register), [["michele", "—", "70", "70", "50", "25", "out.png"]]);
  });
});

test("updates the row an asset already has instead of appending a second one", () => {
  withWorkspace((files) => {
    files.draw("in.png", "200x200", "50,30 149,169");
    // A register as `setup-game` leaves it: declared sizes, nothing measured.
    files.write("assets.md", [
      "| Asset | Declared size | Target height | Measured height | Measured width | Visual Anchor x | File |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      "| michele | 1.75 m | 249 | — | — | — | — |",
      "| raffaele | 1.80 m | 256 | — | — | — | — |",
      "",
    ].join("\n"));
    const register = ["--register", files.path("assets.md"), "--asset", "michele"];
    files.normalise(70, ...register);
    files.normalise(90, ...register);
    assert.deepEqual(rows(files.read("assets.md")), [
      ["michele", "1.75 m", "90", "90", "64", "32", "out.png"],
      ["raffaele", "1.80 m", "256", "—", "—", "—", "—"],
    ]);
  });
});
