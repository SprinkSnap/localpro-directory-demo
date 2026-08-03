import type { FaqItem } from "@/lib/types";

export const HOME_FAQS: FaqItem[] = [
  {
    question: "Is LocalPro Directory a real marketplace?",
    answer:
      "No. LocalPro Directory is a fictional portfolio demonstration created by Che Xu Studio to show directory architecture, search UX, lead generation and responsible SEO patterns.",
  },
  {
    question: "Are the professionals real?",
    answer:
      "No. Every business name, service area and profile is fictional demonstration data. No real providers are contacted and no real accounts are created.",
  },
  {
    question: "Can Che Xu Studio customize this design?",
    answer:
      "Yes. Che Xu Studio can adapt the information architecture, visual system, search behaviour, onboarding flows and content model to your brand, categories and markets.",
  },
  {
    question: "Can the platform support thousands of listings?",
    answer:
      "Yes. The architecture is designed around indexed database queries, bounded pagination, edge caching and progressive enhancement so listing growth does not require shipping the full dataset to browsers.",
  },
  {
    question: "Can businesses manage their own profiles?",
    answer:
      "In a production implementation, yes—through authenticated onboarding, moderation and ownership controls. This demo only shows the interaction flow and does not create accounts.",
  },
  {
    question: "Can a real directory include paid plans?",
    answer:
      "Yes. The plans page demonstrates monetization architecture with clear sponsored-placement labelling. Live payments are intentionally disabled in this demo.",
  },
  {
    question: "Can listings connect to an existing CRM?",
    answer:
      "A production build can route approved enquiries into CRM, email or ticketing systems using server-side integrations and consent-aware data handling.",
  },
  {
    question: "Can the platform support multiple cities?",
    answer:
      "Yes. Area entities, category-plus-area templates and quality gates are designed so multi-city expansion remains structured without mass-publishing thin doorway pages.",
  },
  {
    question: "How does Che Xu Studio prevent thin location pages?",
    answer:
      "Indexable pages require meaningful demand signals, unique introductions, useful service context, relevant provider results, correct metadata and a quality gate that blocks near-duplicates and empty pages.",
  },
  {
    question: "Can the platform support moderation and verification?",
    answer:
      "Yes in a real deployment. Verification, reporting, duplicate detection and ownership disputes require operational processes. This fictional demo does not claim those processes are active.",
  },
  {
    question: "Can Che Xu Studio implement directory SEO?",
    answer:
      "Yes. Che Xu Studio implements technical SEO, structured data for verified content, internal linking and responsible programmatic page generation—never fabricated ratings or LocalBusiness markup for fictional listings.",
  },
];
