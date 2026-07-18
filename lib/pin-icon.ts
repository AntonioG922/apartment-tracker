import L from "leaflet";
import { VERDICT_COLORS, VERDICT_OPTIONS, type Verdict } from "./apartment-fields";

// A plain emoji-based divIcon avoids Leaflet's default marker image assets,
// which don't resolve correctly through bundlers without extra config.
export const PIN_ICON = L.divIcon({
  html: '<div style="font-size:32px;line-height:1;filter:drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))">📍</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

function verdictPinIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export const VERDICT_PIN_ICONS: Record<Verdict, L.DivIcon> = Object.fromEntries(
  VERDICT_OPTIONS.map((v) => [v, verdictPinIcon(VERDICT_COLORS[v])]),
) as Record<Verdict, L.DivIcon>;
