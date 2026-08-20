# 15 — Category and Listing Schema Audit

## Summary
The category system is one of the most thoroughly defined static data structures in the project. It spans 15 categories with subcategories, filters, spec fields, and selling form configuration — all hardcoded in TypeScript files.

---

## Categories (15 Total)

### Admin (`admin/src/data/categorySchema.ts` — 947 lines, 26.5KB)

| # | Category ID | Name | Row | Subcategories | Filters | Spec Fields |
|---|---|---|---|---|---|---|
| 1 | `cars` | Cars | 1 | 7 (Sedan, SUV, Hatchback, Luxury, MUV, Coupe, Convertible) | 9 | 12 (brand, model, year, fuel, transmission, km, owners, etc.) |
| 2 | `bikes` | Bikes & Scooters | 1 | 5 (Sports, Cruiser, Commuter, Scooter, Electric) | 7 | 7 |
| 3 | `mobiles` | Mobiles | 1 | 5 (Smartphones, Feature Phones, Tablets, Accessories, Smartwatches) | 8 | 9 (brand, model, storage, RAM, warranty, etc.) |
| 4 | `electronics` | Electronics | 1 | 6 (Laptops, Cameras, TVs, Audio, Gaming, Other) | 6 | 7 |
| 5 | `properties` | Properties | 1 | 6 (Apartments, Houses, PG/Hostels, Commercial, Plots, Co-working) | 10 | N/A |
| 6 | `furniture` | Furniture & Décor | 2 | 6 (Sofa, Beds, Tables, Chairs, Wardrobe, Décor) | 5 | 6 |
| 7 | `fashion` | Fashion | 2 | 6 (Men, Women, Kids, Accessories, Footwear, Ethnic) | 6 | 5 |
| 8 | `books` | Books, Music & Hobbies | 2 | 5 (Books, Music, Sports, Art & Craft, Games) | 4 | 4 |
| 9 | `services` | Services | 2 | 5 (Home Services, Personal Care, Events, Education, Other) | 3 | 3 |
| 10 | `jobs` | Jobs | 2 | 5 (Full-time, Part-time, Freelance, Internship, Work from Home) | 5 | N/A |
| 11 | `home_appliances` | Home Appliances | 3 | 5 (Kitchen, Laundry, Cooling, Heating, Cleaning) | 5 | 5 |
| 12 | `gym_sports` | Gym & Sports | 3 | 5 (Gym Equipment, Outdoor Sports, Indoor Games, Cycling, Swimming) | 4 | 4 |
| 13 | `kids` | Kids & Baby | 3 | 5 (Toys, Clothing, Baby Gear, School Supplies, Safety) | 4 | 3 |
| 14 | `pets` | Pets | 3 | 5 (Dogs, Cats, Birds, Fish, Accessories) | 4 | 4 |
| 15 | `other` | Other | 3 | 3 (Miscellaneous, Free Items, Wanted) | 2 | 1 |

### Frontend (`frontend/src/lib/mock.ts` — CATEGORIES array)

| Category | Has Icon | Has Subcategories |
|---|---|---|
| `cars` | YES | YES |
| `bikes` | YES | YES |
| `mobiles` | YES | YES |
| `electronics` | YES | YES |
| `properties` | YES | YES |
| `furniture` | YES | YES |
| `fashion` | YES | YES |
| `books` | YES | YES |
| `services` | YES | YES |
| `jobs` | YES | YES |
| `home_appliances` | YES | YES |
| `gym_sports` | YES | YES |
| `kids` | YES | YES |
| `pets` | YES | YES |
| `other` | YES | YES |

**Both portals have the same 15 categories** with matching IDs. The definitions are duplicated.

---

## Category Spec Configuration (Frontend — `lib/specConfig.ts`)

Category-specific form fields for the sell form:

| Category | Required Spec Fields | Optional Fields |
|---|---|---|
| `cars` | Brand, Model, Manufacturing year, Fuel type, Transmission, Kilometres driven, Number of owners | Variant, Registration year, Registration state, Insurance, Colour |
| `bikes` | Brand, Model, Year, Kilometres driven, Number of owners | Engine capacity, Registration state |
| `mobiles` | Brand, Model, Storage | RAM, Colour, Warranty, Battery condition, Accessories, Invoice available |
| `electronics` | Brand, Product type, Working condition | Model, Purchase year, Warranty, Accessories |
| `furniture` | Furniture type | Material, Dimensions, Condition details, Colour, Brand |
| `fashion` | Type, Size, Gender | Brand, Colour, Material |
| `properties` | Property type, Bedrooms, Area (sqft), Facing | Floor, Total floors, Furnished, Parking, Age |
| `home_appliances` | Brand, Appliance type | Purchase year, Warranty, Working condition |
| `other` | (none required) | Description only |

---

## Listing Status State Machine

### User Portal (`lib/listings.ts`)

```
draft → under_review → active
               ↓              ↓
        requires_changes → active (after edit)
               ↓
          rejected
          
active → paused → active
active → sold
active → expired → active (after renew)
active → removed
```

### Admin Portal (`types/index.ts`)

```
draft → submitted → pending_review → assigned → under_review
                                                       ↓
                                              requires_changes → submitted
                                                       ↓
                                               approved → active
                                                       ↓
                                                  rejected
                                                  
active → paused → active
active → reported → under_investigation → removed / actioned
active → expired → archived
active → sold → archived
```

**Problem:** The user portal has a simpler status machine than the admin portal defines. When backend is built, the `ListingStatus` enum must be reconciled.

---

## Category ID Consistency

| Category ID | Frontend `mock.ts` | Admin `categorySchema.ts` | Admin `mock.ts` | Match? |
|---|---|---|---|---|
| `cars` | YES | YES | YES | YES |
| `bikes` | YES | YES | YES | YES |
| `mobiles` | YES | YES | YES | YES |
| `electronics` | YES | YES | YES | YES |
| `properties` | YES | YES | NO | PARTIAL |
| `furniture` | YES | YES | YES | YES |
| `fashion` | YES | YES | YES | YES |
| `books` | YES | YES | NO | PARTIAL |
| `services` | YES | YES | NO | PARTIAL |
| `jobs` | YES | YES | NO | PARTIAL |
| `home_appliances` | YES | YES | NO | PARTIAL |
| `gym_sports` | YES | YES | NO | PARTIAL |
| `kids` | YES | YES | NO | PARTIAL |
| `pets` | YES | YES | NO | PARTIAL |
| `other` | YES | YES | NO | PARTIAL |

Admin mock data only has 4 categories in its 4 mock listings — no inconsistency in IDs themselves, just not all categories represented.

---

## Filtering Capabilities (Frontend)

| Filter Type | UI | Function | Applied On |
|---|---|---|---|
| Category | YES | Client-side filter | `lib/mock.ts` PRODUCTS |
| Subcategory | YES | Client-side filter | `lib/mock.ts` PRODUCTS |
| Price range | YES | Client-side filter | Price field of product |
| Condition | YES | Client-side filter | Condition field |
| Location/pincode | YES | Client-side filter | Area/pincode field |
| Sort by | YES | Client-side sort | Various fields |
| Free items | YES | Client-side filter | `free` boolean |
| Verified seller | YES | UI only | Not implemented in filter logic |
| With photo | YES | Client-side filter | Images array |
| Negotiable | YES | Client-side filter | `negotiable` boolean |

All filters operate on the in-memory `PRODUCTS` array. When backend is added, these must be converted to query parameters.

---

## Critical Duplication Problem

The category definitions exist in multiple places:
1. `admin/src/data/categorySchema.ts` — Full definitions (26.5KB)
2. `frontend/src/lib/mock.ts` — Simplified category list
3. `frontend/src/lib/specConfig.ts` — Spec field config
4. `frontend/src/lib/listings.ts` — Category display labels
5. `frontend/src/routes/ads.new.tsx` — Hardcoded category array

**When a category changes, it must be updated in 5+ places.** This needs to be moved to a single database-driven source of truth.
