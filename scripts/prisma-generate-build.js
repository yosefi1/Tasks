"use strict";
const { execSync } = require("child_process");

// For build (Vercel) when DATABASE_URL/DIRECT_URL are not set - use dummies so prisma generate succeeds
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "postgresql://build:build@localhost:5432/build";
if (!process.env.DIRECT_URL) process.env.DIRECT_URL = "postgresql://build:build@localhost:5432/build";

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
