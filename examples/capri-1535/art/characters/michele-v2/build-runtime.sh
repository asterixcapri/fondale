#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
runtime_dir="${script_dir}/../../../src/characters/michele"
work_dir="$(mktemp -d)"
trap 'rm -rf "${work_dir}"' EXIT

cell_width=192
cell_height=288
figure_width=184
figure_height=276

build_strip() {
  local source_name="$1"
  local row="$2"
  local columns="$3"
  local sequence="$4"
  local output_name="$5"
  local source_path="${script_dir}/${source_name}.png"
  local source_width source_height source_cell_width source_cell_height source_geometry
  local max_width=0
  local max_height=0

  source_geometry="$(magick identify -format '%w %h' "${source_path}")"
  read -r source_width source_height <<< "${source_geometry}"
  source_cell_width=$((source_width / columns))
  source_cell_height=$((source_height / 2))

  for ((column = 0; column < columns; column += 1)); do
    local frame_path="${work_dir}/${output_name}-key-${column}.png"
    local frame_width frame_height frame_geometry

    magick "${source_path}" \
      -crop "${source_cell_width}x${source_cell_height}+$((column * source_cell_width))+$((row * source_cell_height))" \
      +repage -trim +repage "${frame_path}"
    frame_geometry="$(magick identify -format '%w %h' "${frame_path}")"
    read -r frame_width frame_height <<< "${frame_geometry}"
    ((frame_width > max_width)) && max_width="${frame_width}"
    ((frame_height > max_height)) && max_height="${frame_height}"
  done

  local scale_percent
  scale_percent="$(awk -v mw="${max_width}" -v mh="${max_height}" \
    -v fw="${figure_width}" -v fh="${figure_height}" \
    'BEGIN { sw = fw / mw; sh = fh / mh; s = sw < sh ? sw : sh; printf "%.6f%%", s * 100 }')"

  for ((column = 0; column < columns; column += 1)); do
    magick "${work_dir}/${output_name}-key-${column}.png" \
      -resize "${scale_percent}" \
      -background none -gravity south -extent "${cell_width}x${cell_height}" \
      "${work_dir}/${output_name}-frame-${column}.png"
  done

  local -a frame_paths=()
  local frame_index
  IFS=',' read -ra frame_indexes <<< "${sequence}"
  for frame_index in "${frame_indexes[@]}"; do
    frame_paths+=("${work_dir}/${output_name}-frame-${frame_index}.png")
  done

  magick "${frame_paths[@]}" +append "${runtime_dir}/${output_name}.png"
}

build_strip idle-sides 0 3 '0,1,2,2,1,0' workwear-idle-left
build_strip idle-sides 1 3 '0,1,2,2,1,0' workwear-idle-right
build_strip idle-front-back 0 3 '0,1,2,2,1,0' workwear-idle-front
build_strip idle-front-back 1 3 '0,1,2,2,1,0' workwear-idle-back

build_strip speaking-sides 0 4 '0,1,2,3,2,1,0,0' workwear-speaking-left
build_strip speaking-sides 1 4 '0,1,2,3,2,1,0,0' workwear-speaking-right
build_strip speaking-front-back 0 4 '0,1,2,3,2,1,0,0' workwear-speaking-front
build_strip speaking-front-back 1 4 '0,1,2,3,2,1,0,0' workwear-speaking-back

build_strip walking-sides 0 4 '0,1,2,3,0,1,2,3' workwear-walking-left
build_strip walking-sides 1 4 '0,1,2,3,0,1,2,3' workwear-walking-right
build_strip walking-front-back 0 4 '0,1,2,3,0,1,2,3' workwear-walking-front
build_strip walking-front-back 1 4 '0,1,2,3,0,1,2,3' workwear-walking-back

build_strip idle-sides 0 3 '0,1,2,2,1,0' workwear-resolve-left
build_strip idle-sides 1 3 '0,1,2,2,1,0' workwear-resolve-right
build_strip idle-front-back 0 3 '0,1,2,2,1,0' workwear-resolve-front
build_strip idle-front-back 1 3 '0,1,2,2,1,0' workwear-resolve-back

build_strip use-winch-sides 0 4 '0,1,1,2,2,3,3,3' workwear-use-winch-left
build_strip use-winch-sides 1 4 '0,1,1,2,2,3,3,3' workwear-use-winch-right
build_strip use-winch-front-back 0 4 '0,1,1,2,2,3,3,3' workwear-use-winch-front
build_strip use-winch-front-back 1 4 '0,1,1,2,2,3,3,3' workwear-use-winch-back

build_strip pick-up-sides 0 4 '0,1,1,2,2,3,3,3' workwear-pick-up-left
build_strip pick-up-sides 1 4 '0,1,1,2,2,3,3,3' workwear-pick-up-right
build_strip pick-up-front-back 0 4 '0,1,1,2,2,3,3,3' workwear-pick-up-front
build_strip pick-up-front-back 1 4 '0,1,1,2,2,3,3,3' workwear-pick-up-back

# Idle is intentionally almost imperceptible: hands and pose stay fixed while a
# sub-pixel-scale chest breath varies only the vertical extent. Keep this final
# derivation separate from the broader construction poses above.
for facing in left right front back; do
  magick "${runtime_dir}/workwear-idle-${facing}.png" \
    -crop "${cell_width}x${cell_height}+0+0" +repage \
    "${work_dir}/idle-${facing}-base.png"
  magick \
    "${work_dir}/idle-${facing}-base.png" \
    "${work_dir}/idle-${facing}-base.png" \
    \( "${work_dir}/idle-${facing}-base.png" -resize '100x99.7%' \
       -background none -gravity south -extent "${cell_width}x${cell_height}" \) \
    "${work_dir}/idle-${facing}-base.png" \
    \( "${work_dir}/idle-${facing}-base.png" -resize '100x99.7%' \
       -background none -gravity south -extent "${cell_width}x${cell_height}" \) \
    "${work_dir}/idle-${facing}-base.png" \
    +append "${runtime_dir}/workwear-idle-${facing}.png"
done

# Generated side-walk masters can differ in source figure scale. Normalize both
# profile presentations to the same 276-pixel visible-height contract.
for facing in left right; do
  for ((frame = 0; frame < 8; frame += 1)); do
    magick "${runtime_dir}/workwear-walking-${facing}.png" \
      -crop "${cell_width}x${cell_height}+$((frame * cell_width))+0" +repage \
      -trim +repage -resize x276 -background none -gravity south \
      -extent "${cell_width}x${cell_height}" \
      "${work_dir}/walking-${facing}-${frame}.png"
  done
  magick "${work_dir}/walking-${facing}-"{0,1,2,3,4,5,6,7}.png \
    +append "${runtime_dir}/workwear-walking-${facing}.png"
done

# Speaking is a facial performance. The generated side sheets contain two
# broad arm accents that change the silhouette, so exclude those poses and use
# only the three narrow, arms-at-rest mouth/head keys. Front and back masters
# already keep their silhouette stable.
for facing in left right; do
  for frame in 0 1 3; do
    magick "${runtime_dir}/workwear-speaking-${facing}.png" \
      -crop "${cell_width}x${cell_height}+$((frame * cell_width))+0" +repage \
      "${work_dir}/speaking-${facing}-${frame}.png"
  done
  magick \
    "${work_dir}/speaking-${facing}-0.png" \
    "${work_dir}/speaking-${facing}-1.png" \
    "${work_dir}/speaking-${facing}-3.png" \
    "${work_dir}/speaking-${facing}-1.png" \
    "${work_dir}/speaking-${facing}-0.png" \
    "${work_dir}/speaking-${facing}-1.png" \
    "${work_dir}/speaking-${facing}-3.png" \
    "${work_dir}/speaking-${facing}-0.png" \
    +append "${runtime_dir}/workwear-speaking-${facing}.png"
done
