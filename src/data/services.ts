import type { Service } from "@/lib/types";

export const SERVICES: Service[] = [
  // HVAC
  { id: "svc-hvac-tune", slug: "seasonal-system-tune-up", name: "Seasonal System Tune-Up", categoryId: "cat-hvac", shortDescription: "Routine seasonal comfort-system checkups." },
  { id: "svc-hvac-install", slug: "system-installation-consult", name: "System Installation Consult", categoryId: "cat-hvac", shortDescription: "Planning support for replacement projects." },
  { id: "svc-hvac-filter", slug: "filter-and-airflow-review", name: "Filter and Airflow Review", categoryId: "cat-hvac", shortDescription: "Airflow and filter maintenance discovery." },
  // Plumbing
  { id: "svc-plumb-fixture", slug: "fixture-updates", name: "Fixture Updates", categoryId: "cat-plumbing", shortDescription: "Tap, sink and fixture update support." },
  { id: "svc-plumb-drain", slug: "drain-assessment", name: "Drain Assessment", categoryId: "cat-plumbing", shortDescription: "Routine drain and flow assessments." },
  { id: "svc-plumb-water", slug: "water-heater-support", name: "Water Heater Support", categoryId: "cat-plumbing", shortDescription: "Water heater service discovery." },
  // Electrical
  { id: "svc-elec-lighting", slug: "lighting-upgrades", name: "Lighting Upgrades", categoryId: "cat-electrical", shortDescription: "Interior and exterior lighting projects." },
  { id: "svc-elec-outlet", slug: "outlet-and-switch-updates", name: "Outlet and Switch Updates", categoryId: "cat-electrical", shortDescription: "Common residential electrical updates." },
  { id: "svc-elec-panel", slug: "panel-review-consult", name: "Panel Review Consult", categoryId: "cat-electrical", shortDescription: "Panel review consultation discovery." },
  // Cleaning
  { id: "svc-clean-recurring", slug: "recurring-home-cleaning", name: "Recurring Home Cleaning", categoryId: "cat-cleaning", shortDescription: "Scheduled home cleaning packages." },
  { id: "svc-clean-deep", slug: "deep-clean-visit", name: "Deep Clean Visit", categoryId: "cat-cleaning", shortDescription: "One-time deep cleaning discovery." },
  { id: "svc-clean-move", slug: "move-in-move-out-clean", name: "Move-In / Move-Out Clean", categoryId: "cat-cleaning", shortDescription: "Transition cleaning support." },
  // Landscaping
  { id: "svc-land-lawn", slug: "lawn-care", name: "Lawn Care", categoryId: "cat-landscaping", shortDescription: "Seasonal lawn maintenance discovery." },
  { id: "svc-land-garden", slug: "garden-bed-refresh", name: "Garden Bed Refresh", categoryId: "cat-landscaping", shortDescription: "Garden bed planning and refresh." },
  { id: "svc-land-seasonal", slug: "seasonal-cleanup", name: "Seasonal Cleanup", categoryId: "cat-landscaping", shortDescription: "Spring and fall outdoor cleanup." },
  // Moving
  { id: "svc-move-local", slug: "local-move-support", name: "Local Move Support", categoryId: "cat-moving", shortDescription: "Local residential move assistance." },
  { id: "svc-move-pack", slug: "packing-assistance", name: "Packing Assistance", categoryId: "cat-moving", shortDescription: "Packing and labelling support." },
  { id: "svc-move-furniture", slug: "furniture-transport", name: "Furniture Transport", categoryId: "cat-moving", shortDescription: "Large-item transport discovery." },
  // Painting
  { id: "svc-paint-interior", slug: "interior-painting", name: "Interior Painting", categoryId: "cat-painting", shortDescription: "Room and interior paint projects." },
  { id: "svc-paint-exterior", slug: "exterior-painting", name: "Exterior Painting", categoryId: "cat-painting", shortDescription: "Exterior refresh project discovery." },
  { id: "svc-paint-cabinet", slug: "cabinet-refinishing", name: "Cabinet Refinishing", categoryId: "cat-painting", shortDescription: "Cabinet refinishing consultations." },
  // Flooring
  { id: "svc-floor-install", slug: "floor-installation", name: "Floor Installation", categoryId: "cat-flooring", shortDescription: "Flooring installation discovery." },
  { id: "svc-floor-refinish", slug: "hardwood-refinishing", name: "Hardwood Refinishing", categoryId: "cat-flooring", shortDescription: "Hardwood refinishing projects." },
  { id: "svc-floor-tile", slug: "tile-layout-support", name: "Tile Layout Support", categoryId: "cat-flooring", shortDescription: "Tile layout planning support." },
  // Appliance
  { id: "svc-app-diag", slug: "appliance-diagnosis", name: "Appliance Diagnosis", categoryId: "cat-appliance", shortDescription: "Household appliance assessment." },
  { id: "svc-app-washer", slug: "laundry-appliance-support", name: "Laundry Appliance Support", categoryId: "cat-appliance", shortDescription: "Washer and dryer service discovery." },
  { id: "svc-app-kitchen", slug: "kitchen-appliance-support", name: "Kitchen Appliance Support", categoryId: "cat-appliance", shortDescription: "Kitchen appliance service discovery." },
  // Auto
  { id: "svc-auto-interior", slug: "interior-detailing", name: "Interior Detailing", categoryId: "cat-auto", shortDescription: "Interior vehicle care packages." },
  { id: "svc-auto-exterior", slug: "exterior-detailing", name: "Exterior Detailing", categoryId: "cat-auto", shortDescription: "Exterior wash and finish care." },
  { id: "svc-auto-full", slug: "full-detail-package", name: "Full Detail Package", categoryId: "cat-auto", shortDescription: "Complete detailing package discovery." },
  // Pet
  { id: "svc-pet-bath", slug: "bath-and-brush", name: "Bath and Brush", categoryId: "cat-pet", shortDescription: "Bath and brush grooming packages." },
  { id: "svc-pet-full", slug: "full-groom-package", name: "Full Groom Package", categoryId: "cat-pet", shortDescription: "Full grooming appointment discovery." },
  { id: "svc-pet-nail", slug: "nail-and-ear-care", name: "Nail and Ear Care", categoryId: "cat-pet", shortDescription: "Routine nail and ear care visits." },
  // Photo
  { id: "svc-photo-portrait", slug: "portrait-sessions", name: "Portrait Sessions", categoryId: "cat-photo", shortDescription: "Portrait session discovery." },
  { id: "svc-photo-event", slug: "event-coverage", name: "Event Coverage", categoryId: "cat-photo", shortDescription: "Event photography coverage." },
  { id: "svc-photo-product", slug: "product-photography", name: "Product Photography", categoryId: "cat-photo", shortDescription: "Product and catalogue photography." },
  // IT
  { id: "svc-it-device", slug: "device-setup-support", name: "Device Setup Support", categoryId: "cat-it", shortDescription: "Device setup and migration help." },
  { id: "svc-it-network", slug: "home-network-review", name: "Home Network Review", categoryId: "cat-it", shortDescription: "Home network assessment discovery." },
  { id: "svc-it-smallbiz", slug: "small-business-tech-support", name: "Small-Business Tech Support", categoryId: "cat-it", shortDescription: "Local small-business tech support." },
  // Graphic
  { id: "svc-graph-brand", slug: "brand-identity", name: "Brand Identity", categoryId: "cat-graphic", shortDescription: "Logo and brand identity projects." },
  { id: "svc-graph-print", slug: "print-collateral", name: "Print Collateral", categoryId: "cat-graphic", shortDescription: "Brochure and print design support." },
  { id: "svc-graph-social", slug: "social-visual-kits", name: "Social Visual Kits", categoryId: "cat-graphic", shortDescription: "Social visual kit design." },
  // Web
  { id: "svc-web-marketing", slug: "marketing-site-design", name: "Marketing Site Design", categoryId: "cat-web", shortDescription: "Marketing website design projects." },
  { id: "svc-web-redesign", slug: "website-redesign", name: "Website Redesign", categoryId: "cat-web", shortDescription: "Website redesign discovery." },
  { id: "svc-web-landing", slug: "landing-page-systems", name: "Landing Page Systems", categoryId: "cat-web", shortDescription: "Landing page system design." },
  // Event
  { id: "svc-event-table", slug: "table-styling", name: "Table Styling", categoryId: "cat-event", shortDescription: "Table and reception styling." },
  { id: "svc-event-balloon", slug: "balloon-and-backdrop", name: "Balloon and Backdrop", categoryId: "cat-event", shortDescription: "Balloon and backdrop installations." },
  { id: "svc-event-full", slug: "full-event-styling", name: "Full Event Styling", categoryId: "cat-event", shortDescription: "Complete event décor packages." },
  // Organize
  { id: "svc-org-closet", slug: "closet-refresh", name: "Closet Refresh", categoryId: "cat-organize", shortDescription: "Closet organization projects." },
  { id: "svc-org-kitchen", slug: "kitchen-organization", name: "Kitchen Organization", categoryId: "cat-organize", shortDescription: "Kitchen space planning support." },
  { id: "svc-org-whole", slug: "whole-home-reset", name: "Whole-Home Reset", categoryId: "cat-organize", shortDescription: "Whole-home organization planning." },
  // Handyman
  { id: "svc-handy-mount", slug: "mounting-and-installs", name: "Mounting and Installs", categoryId: "cat-handyman", shortDescription: "TV, shelf and fixture installs." },
  { id: "svc-handy-repair", slug: "general-home-repairs", name: "General Home Repairs", categoryId: "cat-handyman", shortDescription: "Everyday home repair discovery." },
  { id: "svc-handy-seasonal", slug: "seasonal-home-prep", name: "Seasonal Home Prep", categoryId: "cat-handyman", shortDescription: "Seasonal home preparation tasks." },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServicesByCategory(categoryId: string): Service[] {
  return SERVICES.filter((s) => s.categoryId === categoryId);
}
