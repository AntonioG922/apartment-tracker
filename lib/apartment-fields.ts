export const LAUNDRY_OPTIONS = ["in-unit", "in-building", "none"] as const;
export type Laundry = (typeof LAUNDRY_OPTIONS)[number];

export const OUTDOOR_SPACE_OPTIONS = [
  "none",
  "balcony",
  "terrace",
  "shared-roof",
  "backyard",
] as const;
export type OutdoorSpace = (typeof OUTDOOR_SPACE_OPTIONS)[number];

export const EXPOSURE_OPTIONS = ["N", "S", "E", "W"] as const;
export type Exposure = (typeof EXPOSURE_OPTIONS)[number];

export const AC_OPTIONS = ["central", "window-units", "mini-split", "none"] as const;
export type Ac = (typeof AC_OPTIONS)[number];

export const UTILITIES_OPTIONS = ["heat", "hot water", "gas", "electric", "wifi"] as const;
export type Utility = (typeof UTILITIES_OPTIONS)[number];

export const VERDICT_OPTIONS = ["yes", "maybe", "no", "not-toured-yet"] as const;
export type Verdict = (typeof VERDICT_OPTIONS)[number];

export const VERDICT_LABELS: Record<Verdict, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
  "not-toured-yet": "Not toured yet",
};

export const VERDICT_COLORS: Record<Verdict, string> = {
  yes: "#16a34a", // green-600
  maybe: "#f59e0b", // amber-500
  no: "#ef4444", // red-500
  "not-toured-yet": "#9ca3af", // gray-400
};
