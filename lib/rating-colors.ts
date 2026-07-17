// Color ramp for block segments, by rating: unrated = gray, 1-2 = red ramp,
// 3 = amber, 4-5 = green ramp.
const RATING_COLORS: Record<number, string> = {
  0: "#9ca3af", // gray-400
  1: "#b91c1c", // red-700
  2: "#ef4444", // red-500
  3: "#f59e0b", // amber-500
  4: "#4ade80", // green-400
  5: "#16a34a", // green-600
};

export function ratingColor(rating: number): string {
  return RATING_COLORS[rating] ?? RATING_COLORS[0];
}
