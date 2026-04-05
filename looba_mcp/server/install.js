#!/usr/bin/env node
import { execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
execSync("npm install --omit=dev", { cwd: dir, stdio: "inherit" });
