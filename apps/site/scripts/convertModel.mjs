// Usage: node scripts/convertModel.mjs [input.obj] [output.glb]
//
// Converts the design OBJ (objects of `f v/vt/vn` polygons; texture coordinates and materials
// are ignored) to a meshopt compressed GLB. One mesh per OBJ object, named after it: the scene assigns materials by name.

import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  meshopt,
  normals,
  prune,
  weld,
} from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const DEFAULT_INPUT = fileURLToPath(
  new URL('../../../design/reference/jukebox.obj', import.meta.url),
);
const DEFAULT_OUTPUT = fileURLToPath(
  new URL('../public/models/jukebox.glb', import.meta.url),
);
const VECTOR_SIZE = 3;
const BYTES_PER_KIB = 1024;

function parseVector(fields) {
  return fields.slice(1, VECTOR_SIZE + 1).map(Number);
}

// OBJ indices are 1-based and global across objects.
function parseCorner(field) {
  const [position, , normal] = field.split('/');
  return { position: Number(position) - 1, normal: Number(normal) - 1 };
}

// The displays are convex quads: a fan from the first corner splits them into triangles.
function triangulate(corners) {
  const [first, ...rest] = corners;
  return rest.slice(0, -1).flatMap((corner, i) => [first, corner, rest[i + 1]]);
}

export function parseObj(source) {
  const positions = [];
  const normalVectors = [];
  const objects = [];
  let current = null;

  for (const line of source.split(/\r?\n/)) {
    const fields = line.trim().split(/\s+/);
    const [keyword] = fields;
    if (keyword === 'v') positions.push(parseVector(fields));
    else if (keyword === 'vn') normalVectors.push(parseVector(fields));
    else if (keyword === 'o') {
      current = { name: fields[1], corners: [] };
      objects.push(current);
    } else if (keyword === 'f') {
      current?.corners.push(...triangulate(fields.slice(1).map(parseCorner)));
    }
  }

  return { positions, normalVectors, objects };
}

// Authored normals are kept: they split at the cabinet's hard edges, which smooth recomputed
// normals would round off. Corners sharing a position and a normal become one vertex.
function buildIndexedGeometry({ corners }, positions, normalVectors) {
  const vertexIds = new Map();
  const positionArray = [];
  const normalArray = [];
  const indices = corners.map(({ position, normal }) => {
    const key = `${position}/${normal}`;
    if (!vertexIds.has(key)) {
      vertexIds.set(key, vertexIds.size);
      positionArray.push(...positions[position]);
      normalArray.push(...normalVectors[normal]);
    }
    return vertexIds.get(key);
  });

  return {
    positions: new Float32Array(positionArray),
    normals: new Float32Array(normalArray),
    indices: new Uint32Array(indices),
  };
}

export function createModelDocument({ positions, normalVectors, objects }) {
  const document = new Document();
  const buffer = document.createBuffer();
  const scene = document.createScene('Jukebox');

  for (const object of objects) {
    const geometry = buildIndexedGeometry(object, positions, normalVectors);
    const accessor = (type, array) =>
      document.createAccessor().setType(type).setArray(array).setBuffer(buffer);
    const primitive = document
      .createPrimitive()
      .setAttribute('POSITION', accessor('VEC3', geometry.positions))
      .setAttribute('NORMAL', accessor('VEC3', geometry.normals))
      .setIndices(accessor('SCALAR', geometry.indices));
    const mesh = document.createMesh(object.name).addPrimitive(primitive);
    scene.addChild(document.createNode(object.name).setMesh(mesh));
  }

  return document;
}

async function convertModel(inputPath, outputPath) {
  await MeshoptEncoder.ready;
  const document = createModelDocument(
    parseObj(readFileSync(inputPath, 'utf8')),
  );
  await document.transform(
    normals({ overwrite: false }),
    weld(),
    dedup(),
    prune(),
    meshopt({ encoder: MeshoptEncoder }),
  );

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  writeFileSync(outputPath, await io.writeBinary(document));
  const sizeKib = (statSync(outputPath).size / BYTES_PER_KIB).toFixed(1);
  process.stdout.write(`Wrote ${outputPath} (${sizeKib} KiB)\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , inputPath = DEFAULT_INPUT, outputPath = DEFAULT_OUTPUT] =
    process.argv;
  await convertModel(inputPath, outputPath);
}
