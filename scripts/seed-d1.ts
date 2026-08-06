/**
 * Seed D1 from the deterministic TypeScript dataset.
 * Usage:
 *   npx tsx scripts/seed-d1.ts --local
 *   npx tsx scripts/seed-d1.ts --remote   (requires auth; do not run without authorization)
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { CATEGORIES } from "../src/data/categories";
import { AREAS } from "../src/data/areas";
import { SERVICES } from "../src/data/services";
import { generateProviders } from "../src/data/seed-providers";

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const remote = process.argv.includes("--remote");
const local = process.argv.includes("--local") || !remote;
const providers = generateProviders();

const statements: string[] = [
  "PRAGMA foreign_keys = ON;",
  "DELETE FROM portfolio_leads;",
  "DELETE FROM provider_images;",
  "DELETE FROM provider_areas;",
  "DELETE FROM provider_services;",
  "DELETE FROM provider_categories;",
  "DELETE FROM providers;",
  "DELETE FROM services;",
  "DELETE FROM areas;",
  "DELETE FROM categories;",
];

for (const category of CATEGORIES) {
  statements.push(
    `INSERT INTO categories (id, slug, name, short_description, long_description, icon, sort_order) VALUES (${sqlString(category.id)}, ${sqlString(category.slug)}, ${sqlString(category.name)}, ${sqlString(category.shortDescription)}, ${sqlString(category.longDescription)}, ${sqlString(category.icon)}, ${category.sortOrder});`,
  );
}

for (const area of AREAS) {
  statements.push(
    `INSERT INTO areas (id, slug, name, district_group, short_description, long_description, sort_order) VALUES (${sqlString(area.id)}, ${sqlString(area.slug)}, ${sqlString(area.name)}, ${sqlString(area.districtGroup)}, ${sqlString(area.shortDescription)}, ${sqlString(area.longDescription)}, ${area.sortOrder});`,
  );
}

for (const service of SERVICES) {
  statements.push(
    `INSERT INTO services (id, slug, name, category_id, short_description) VALUES (${sqlString(service.id)}, ${sqlString(service.slug)}, ${sqlString(service.name)}, ${sqlString(service.categoryId)}, ${sqlString(service.shortDescription)});`,
  );
}

for (const provider of providers) {
  statements.push(
    `INSERT INTO providers (id, slug, name, name_normalized, concept_label, short_description, long_description, primary_category_id, image_alt, business_type, profile_completeness, sponsored_demo, featured, response_preference, created_at, updated_at) VALUES (${sqlString(provider.id)}, ${sqlString(provider.slug)}, ${sqlString(provider.name)}, ${sqlString(normalize(provider.name))}, ${sqlString(provider.conceptLabel)}, ${sqlString(provider.shortDescription)}, ${sqlString(provider.longDescription)}, ${sqlString(provider.primaryCategoryId)}, ${sqlString(provider.imageAlt)}, ${sqlString(provider.businessType)}, ${provider.profileCompleteness}, ${provider.sponsoredDemo ? 1 : 0}, ${provider.featured ? 1 : 0}, ${sqlString(provider.responsePreference)}, ${sqlString(provider.createdAt)}, ${sqlString(provider.updatedAt)});`,
  );

  for (const categoryId of provider.categoryIds) {
    statements.push(
      `INSERT INTO provider_categories (provider_id, category_id) VALUES (${sqlString(provider.id)}, ${sqlString(categoryId)});`,
    );
  }
  for (const serviceId of provider.serviceIds) {
    statements.push(
      `INSERT INTO provider_services (provider_id, service_id) VALUES (${sqlString(provider.id)}, ${sqlString(serviceId)});`,
    );
  }
  for (const areaId of provider.areaIds) {
    statements.push(
      `INSERT INTO provider_areas (provider_id, area_id) VALUES (${sqlString(provider.id)}, ${sqlString(areaId)});`,
    );
  }
  for (const image of provider.portfolioImages) {
    statements.push(
      `INSERT INTO provider_images (id, provider_id, src, alt, sort_order, kind) VALUES (${sqlString(image.id)}, ${sqlString(provider.id)}, ${sqlString(image.src)}, ${sqlString(image.alt)}, ${image.sortOrder}, ${sqlString(image.kind)});`,
    );
  }
}

const outDir = path.resolve("data/generated");
mkdirSync(outDir, { recursive: true });
const sqlPath = path.join(outDir, "seed.sql");
writeFileSync(sqlPath, statements.join("\n"), "utf8");
console.log(`Wrote ${statements.length} SQL statements for ${providers.length} providers to ${sqlPath}`);

const flag = remote ? "--remote" : "--local";
if (remote) {
  console.error("Remote seeding requires explicit authorization. Aborting.");
  process.exit(1);
}

execSync(`npx wrangler d1 execute localpro-directory ${flag} --file=${sqlPath}`, {
  stdio: "inherit",
});
console.log(`Seed complete (${local ? "local" : "remote"}).`);
