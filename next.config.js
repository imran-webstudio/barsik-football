/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./src/env.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  // A package-lock.json in the home directory otherwise makes Turbopack
  // treat /Users/bdcalling as the app root and the dashboard client crashes.
  turbopack: {
    root: projectRoot,
  },
};

export default config;
