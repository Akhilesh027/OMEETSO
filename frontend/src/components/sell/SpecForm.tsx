import type { SpecField } from "@/lib/specConfig";
import { cn, preventNonNumericKeyDown, sanitizeNumericInput } from "@/lib/utils";
import {
  getBrandsForCategory,
  getModelsForBrand,
  getCategoryModels,
  findBrandForModel,
} from "@/lib/aiAssistance";

export function SpecForm({
  fields,
  values,
  onChange,
  errors,
  category,
}: {
  fields: SpecField[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  errors?: Record<string, string>;
  category?: string;
}) {
  function set(k: string, v: string) {
    onChange({ ...values, [k]: v });
  }

  // Validate that brand belongs to current category (prevent cross-category leakage)
  const validCategoryBrands = getBrandsForCategory(category);
  const rawBrand = values["Brand"] || values["brand"] || values["Brand / Manufacturer"] || "";
  const isBrandValid = validCategoryBrands.length === 0 || validCategoryBrands.includes(rawBrand) || rawBrand === "Other";
  const brand = isBrandValid ? rawBrand : "";

  // Dynamic Models: If brand is selected, show that brand's models; otherwise show category-relevant models
  const dynamicModels = brand
    ? getModelsForBrand(category, brand)
    : getCategoryModels(category);

  return (
    <div className="space-y-3">
      {fields.map((f) => {
        const err = errors?.[`spec_${f.key}`];
        const id = `spec_${f.key}`;
        const isModel = f.key.toLowerCase() === "model";
        const isBrand = f.key.toLowerCase() === "brand" || f.key.toLowerCase().includes("manufacturer");

        // 1. Category-Appropriate Brand / Manufacturer Selection
        if (isBrand) {
          const brandOptions = validCategoryBrands.length > 0 ? validCategoryBrands : (f.options || []);
          return (
            <div key={f.key}>
              <label htmlFor={id} className="mb-1 block text-xs font-semibold text-foreground">
                {f.label}
                {f.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <select
                id={id}
                value={brand || values[f.key] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextValues: Record<string, string> = {
                    ...values,
                    [f.key]: val,
                    Brand: val,
                    "Brand / Manufacturer": val,
                  };
                  // Clear model if previous model is not valid for new brand
                  if (values["Model"] && values["Model"] !== "Other") {
                    const validForNewBrand = val ? getModelsForBrand(category, val) : [];
                    if (!validForNewBrand.includes(values["Model"])) {
                      nextValues["Model"] = "";
                    }
                  }
                  onChange(nextValues);
                }}
                className={cn("w-full rounded-2xl border bg-background px-3 py-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", err ? "border-red-400" : "border-border")}
              >
                <option value="">Select Brand / Manufacturer…</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="Other">Other / Custom Brand</option>
              </select>
              {err && <p className="mt-1 text-[11px] text-red-600" role="alert">{err}</p>}
            </div>
          );
        }

        // 2. Dynamic Model Dropdown with Category / Brand Relevant Models
        if (isModel && dynamicModels.length > 0) {
          return (
            <div key={f.key}>
              <label htmlFor={id} className="mb-1 block text-xs font-semibold text-foreground">
                {f.label}{brand ? ` (${brand})` : ""}
                {f.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <select
                id={id}
                value={values[f.key] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextValues: Record<string, string> = { ...values, [f.key]: val };
                  // If brand was not set yet, auto-set brand if model matches a known brand
                  if (!brand && val && val !== "Other") {
                    const detected = findBrandForModel(val, category);
                    if (detected) {
                      nextValues["Brand"] = detected;
                      nextValues["Brand / Manufacturer"] = detected;
                    }
                  }
                  onChange(nextValues);
                }}
                className={cn("w-full rounded-2xl border bg-background px-3 py-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", err ? "border-red-400" : "border-border")}
              >
                <option value="">Select Model…</option>
                {dynamicModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="Other">Other / Custom Model</option>
              </select>
              {err && <p className="mt-1 text-[11px] text-red-600" role="alert">{err}</p>}
            </div>
          );
        }

        return (
          <div key={f.key}>
            <label htmlFor={id} className="mb-1 block text-xs font-semibold text-foreground">
              {f.label}
              {f.required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {f.type === "select" ? (
              <select id={id} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
                className={cn("w-full rounded-2xl border bg-background px-3 py-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", err ? "border-red-400" : "border-border")}>
                <option value="">Select…</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "toggle" ? (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => set(f.key, (values[f.key] || "").toLowerCase() === "yes" ? "" : "Yes")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer select-none",
                    (values[f.key] || "").toLowerCase() === "yes"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-card border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", (values[f.key] || "").toLowerCase() === "yes" ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                  <span>Yes</span>
                </button>

                <button
                  type="button"
                  onClick={() => set(f.key, (values[f.key] || "").toLowerCase() === "no" ? "" : "No")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer select-none",
                    (values[f.key] || "").toLowerCase() === "no"
                      ? "bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20 shadow-xs"
                      : "bg-card border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", (values[f.key] || "").toLowerCase() === "no" ? "bg-rose-500" : "bg-muted-foreground/40")} />
                  <span>No</span>
                </button>
              </div>
            ) : (
              <input
                id={id}
                type={f.type === "number" ? "text" : "text"}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, f.type === "number" ? sanitizeNumericInput(e.target.value) : e.target.value)}
                onKeyDown={f.type === "number" ? (e) => preventNonNumericKeyDown(e) : undefined}
                placeholder={f.placeholder}
                inputMode={f.type === "number" ? "numeric" : undefined}
                pattern={f.type === "number" ? "[0-9]*" : undefined}
                className={cn("w-full rounded-2xl border bg-background px-3 py-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", err ? "border-red-400" : "border-border")}
              />
            )}
            {err && <p className="mt-1 text-[11px] text-red-600" role="alert">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}
