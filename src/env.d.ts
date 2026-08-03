/// <reference types="astro/client" />

type Env = {
  DB: D1Database;
  ASSETS?: Fetcher;
  AI?: Ai;
  DEMO_MODE: string;
  PUBLIC_SITE_URL: string;
  PUBLIC_STUDIO_URL: string;
  PUBLIC_CASE_STUDY_URL: string;
  PUBLIC_PACKAGES_URL: string;
  PUBLIC_TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    demoMode: boolean;
    requestId: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_STUDIO_URL: string;
  readonly PUBLIC_CASE_STUDY_URL: string;
  readonly PUBLIC_PACKAGES_URL: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly DEMO_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
