import type { NextConfig } from "next";
import { parsePublicEnv } from "./lib/env/public-schema";
import { parseServerEnv } from "./lib/env/server-schema";

// Validate before dev/build/start, with field names only in diagnostics.
parsePublicEnv(process.env);
parseServerEnv(process.env);

const nextConfig: NextConfig = { poweredByHeader: false };
export default nextConfig;
