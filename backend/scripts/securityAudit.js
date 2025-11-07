#!/usr/bin/env node

/**
 * Security Audit Script
 * Checks for common security misconfigurations
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("🔍 Running Security Audit...\n");

let warnings = 0;
let errors = 0;
let passed = 0;

const check = (name, condition, level = "error", fix = "") => {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    if (level === "error") {
      console.error(`❌ ${name}`);
      if (fix) console.error(`   Fix: ${fix}`);
      errors++;
    } else {
      console.warn(`⚠️  ${name}`);
      if (fix) console.warn(`   Fix: ${fix}`);
      warnings++;
    }
  }
};

// Check Environment Variables
console.log("📋 Environment Variables:\n");

check(
  "JWT_SECRET is set",
  !!process.env.JWT_SECRET,
  "error",
  "Add JWT_SECRET to .env file"
);

check(
  "JWT_SECRET is strong (min 32 chars)",
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
  "error",
  "Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
);

const weakSecrets = [
  "your-super-secret-jwt-key-change-this-in-production",
  "secret",
  "jwt_secret",
  "test",
];
check(
  "JWT_SECRET is not a default/weak value",
  !weakSecrets.includes(process.env.JWT_SECRET?.toLowerCase()),
  "error",
  "Use a randomly generated secret"
);

check(
  "MONGODB_URI is set",
  !!process.env.MONGODB_URI,
  "error",
  "Add MONGODB_URI to .env file"
);

check(
  "NODE_ENV is set",
  !!process.env.NODE_ENV,
  "warning",
  "Set NODE_ENV=production for production deployment"
);

check(
  "ALLOWED_ORIGINS is configured",
  !!process.env.ALLOWED_ORIGINS,
  "warning",
  "Set ALLOWED_ORIGINS to your frontend URL"
);

check(
  "BCRYPT_ROUNDS is set appropriately",
  !process.env.BCRYPT_ROUNDS ||
    (parseInt(process.env.BCRYPT_ROUNDS) >= 10 &&
      parseInt(process.env.BCRYPT_ROUNDS) <= 12),
  "warning",
  "Set BCRYPT_ROUNDS between 10-12 (default is 10)"
);

// Check File Security
console.log("\n📁 File Security:\n");

const envExists = fs.existsSync(path.join(__dirname, "..", ".env"));
check(
  ".env file exists",
  envExists,
  "warning",
  "Create .env file from .env.example"
);

const gitignoreExists = fs.existsSync(
  path.join(__dirname, "..", "..", ".gitignore")
);
if (gitignoreExists) {
  const gitignore = fs.readFileSync(
    path.join(__dirname, "..", "..", ".gitignore"),
    "utf8"
  );
  check(
    ".env files are in .gitignore",
    gitignore.includes(".env"),
    "error",
    "Add .env* to .gitignore"
  );
} else {
  check(
    ".gitignore exists",
    false,
    "error",
    "Create .gitignore file and add .env*"
  );
}

// Check Dependencies
console.log("\n📦 Dependencies:\n");

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);

const requiredDeps = [
  "bcryptjs",
  "jsonwebtoken",
  "express",
  "mongoose",
  "cors",
];
requiredDeps.forEach((dep) => {
  check(
    `${dep} is installed`,
    packageJson.dependencies && packageJson.dependencies[dep],
    "error",
    `npm install ${dep}`
  );
});

check(
  "dotenv is installed",
  packageJson.dependencies?.dotenv || packageJson.devDependencies?.dotenv,
  "warning",
  "npm install dotenv"
);

// Production Checks
if (process.env.NODE_ENV === "production") {
  console.log("\n🏭 Production Environment Checks:\n");

  check(
    "Using HTTPS (ALLOWED_ORIGINS)",
    process.env.ALLOWED_ORIGINS?.includes("https://"),
    "error",
    "Update ALLOWED_ORIGINS to use https:// URLs"
  );

  check(
    "MongoDB connection is secure",
    process.env.MONGODB_URI?.includes("mongodb+srv://") ||
      (process.env.MONGODB_URI?.includes("mongodb://") &&
        process.env.MONGODB_URI?.includes("@")),
    "warning",
    "Use authenticated MongoDB connection (mongodb+srv:// or mongodb://user:pass@...)"
  );

  check(
    "BCRYPT_ROUNDS is at least 12 for production",
    !process.env.BCRYPT_ROUNDS || parseInt(process.env.BCRYPT_ROUNDS) >= 12,
    "warning",
    "Set BCRYPT_ROUNDS=12 for production"
  );
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 Audit Summary:");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Errors: ${errors}`);
console.log("=".repeat(50));

if (errors > 0) {
  console.log("\n❌ Security audit FAILED. Please fix the errors above.");
  process.exit(1);
} else if (warnings > 0) {
  console.log(
    "\n⚠️  Security audit passed with warnings. Consider addressing them."
  );
  process.exit(0);
} else {
  console.log("\n✅ Security audit PASSED! All checks successful.");
  process.exit(0);
}
