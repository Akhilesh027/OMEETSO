import type { Listing } from "./listings";
import { specFieldsFor } from "./specConfig";

export type Validation = {
  ok: boolean;
  errors: Record<string, string>;
  summary: string[];
};

export function validateBasic(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  const t = (l.title ?? "").trim();
  if (t.length < 5) { errors.title = "Title must be at least 5 characters"; summary.push("Title is too short"); }
  else if (t.length > 80) { errors.title = "Title must be under 80 characters"; summary.push("Title is too long"); }
  const d = (l.description ?? "").trim();
  if (d.length < 20) { errors.description = "Description must be at least 20 characters"; summary.push("Description is too short"); }
  else if (d.length > 2000) { errors.description = "Description must be under 2000 characters"; summary.push("Description is too long"); }
  if (!l.free) {
    if (!l.price || l.price <= 0) { errors.price = "Enter a price greater than zero"; summary.push("Price is missing"); }
    else if (l.price > 100000000) { errors.price = "Price seems too high"; summary.push("Price looks unreasonable"); }
  }
  if (!l.condition) { errors.condition = "Choose a condition"; summary.push("Condition not selected"); }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateMedia(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  if (!l.images || l.images.length === 0) {
    errors.images = "Add at least one photo";
    summary.push("At least one photo is required");
  }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateCategory(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  if (!l.category) { errors.category = "Choose a category"; summary.push("Category not selected"); }
  if (!l.subcategory) { errors.subcategory = "Choose a subcategory"; summary.push("Subcategory not selected"); }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateLocation(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  if (!l.pincode || !/^\d{6}$/.test(l.pincode)) {
    errors.pincode = "Enter a 6-digit pincode";
    summary.push("Location pincode required");
  }
  if (!l.area) { errors.area = "Enter your area"; summary.push("Area not set"); }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateContact(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  if (!l.contactPref) { errors.contactPref = "Choose a contact preference"; summary.push("Contact preference required"); }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateSpecs(l: Partial<Listing>): Validation {
  const errors: Record<string, string> = {};
  const summary: string[] = [];
  if (!l.category) return { ok: true, errors, summary };
  const fields = specFieldsFor(l.category);
  const specs = l.specs ?? {};
  for (const f of fields) {
    if (f.required && !specs[f.key]) {
      errors[`spec_${f.key}`] = `${f.label} is required`;
      summary.push(`${f.label} missing`);
    }
  }
  return { ok: Object.keys(errors).length === 0, errors, summary };
}

export function validateAll(l: Partial<Listing>, opts: { specs?: boolean } = {}): Validation {
  const parts = [
    validateMedia(l),
    validateBasic(l),
    validateCategory(l),
    validateLocation(l),
    validateContact(l),
    ...(opts.specs ? [validateSpecs(l)] : []),
  ];
  const errors = Object.assign({}, ...parts.map((p) => p.errors));
  const summary = parts.flatMap((p) => p.summary);
  return { ok: summary.length === 0, errors, summary };
}
