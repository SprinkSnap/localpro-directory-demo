/**
 * Thin wrapper — prefer `npm run screenshots:mobile` or `scripts/capture-screenshots.mjs`.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "capture-screenshots.mjs");
const child = spawn(process.execPath, [script, "--device=mobile"], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
