// Leonida Trophy Atlas — entrypoint for gta6-trophy-guide-01.
//
// Copies the static guide (app/) and the screenshots (screenshots/) from this
// repository into the output directory, then writes dossier.json there with
// the kit's buildDossier library. Node 22, standard library only, and fully
// deterministic: two runs write identical bytes.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

const appSource = join(repoRoot, "app");
const screenshotsSource = join(repoRoot, "screenshots");

mkdirSync(outputDir, { recursive: true });
cpSync(appSource, join(outputDir, "app"), { recursive: true });
cpSync(screenshotsSource, join(outputDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outputDir, { text_max_bytes: 163840 });
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log(`dossier.json written: ${dossier.length} bytes`);
