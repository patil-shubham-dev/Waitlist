import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const publicDist = resolve(root, 'apps/public/dist');
const adminDist = resolve(root, 'apps/admin/dist');
const outputDist = resolve(root, '.next');
const outputAdmin = resolve(outputDist, 'admin7276');


if (!existsSync(publicDist)) {
  throw new Error('Public build output was not found.');
}

if (!existsSync(adminDist)) {
  throw new Error('Admin build output was not found.');
}

rmSync(outputDist, { force: true, recursive: true });
mkdirSync(outputAdmin, { recursive: true });

cpSync(publicDist, outputDist, { recursive: true });
cpSync(adminDist, outputAdmin, { recursive: true });
