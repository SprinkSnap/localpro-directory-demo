-- LocalPro Directory D1 schema
-- Fictional portfolio demonstration dataset

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  short_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  district_group TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  concept_label TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  primary_category_id TEXT NOT NULL REFERENCES categories(id),
  image_alt TEXT NOT NULL,
  business_type TEXT NOT NULL,
  profile_completeness INTEGER NOT NULL CHECK (profile_completeness BETWEEN 0 AND 100),
  sponsored_demo INTEGER NOT NULL DEFAULT 0 CHECK (sponsored_demo IN (0, 1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  response_preference TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_categories (
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);

CREATE TABLE IF NOT EXISTS provider_services (
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, service_id)
);

CREATE TABLE IF NOT EXISTS provider_areas (
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, area_id)
);

CREATE TABLE IF NOT EXISTS provider_images (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL CHECK (kind IN ('thumbnail', 'portfolio'))
);

CREATE TABLE IF NOT EXISTS portfolio_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  platform_type TEXT NOT NULL,
  existing_website TEXT,
  expected_listing_volume TEXT NOT NULL,
  primary_goal TEXT NOT NULL,
  needed_features TEXT NOT NULL,
  launch_timing TEXT NOT NULL,
  message TEXT,
  consent INTEGER NOT NULL CHECK (consent = 1),
  consent_at TEXT NOT NULL,
  source_demo TEXT NOT NULL DEFAULT 'localpro-directory',
  created_at TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT
);

-- Indexes for searchable, bounded queries
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_primary_category ON providers(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_providers_featured ON providers(featured);
CREATE INDEX IF NOT EXISTS idx_providers_sponsored ON providers(sponsored_demo);
CREATE INDEX IF NOT EXISTS idx_providers_name_normalized ON providers(name_normalized);
CREATE INDEX IF NOT EXISTS idx_providers_updated_at ON providers(updated_at);
CREATE INDEX IF NOT EXISTS idx_providers_completeness ON providers(profile_completeness);
CREATE INDEX IF NOT EXISTS idx_providers_business_type ON providers(business_type);
CREATE INDEX IF NOT EXISTS idx_provider_areas_area ON provider_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_provider_categories_category ON provider_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_service ON provider_services(service_id);
CREATE INDEX IF NOT EXISTS idx_provider_images_provider ON provider_images(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_areas_slug ON areas(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_leads_created ON portfolio_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_leads_email ON portfolio_leads(email);
