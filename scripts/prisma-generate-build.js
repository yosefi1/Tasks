"use strict";
const { execSync } = require("child_process");

// For build when DATABASE_URL/DATABASE_URL_UNPOOLED are not set - use dummies so prisma generate succeeds
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "postgresql://build:build@localhost:5432/build";
if (!process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = "postgresql://build:build@localhost:5432/build";

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
