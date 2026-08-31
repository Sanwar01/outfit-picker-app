export type ResolvedLocation = {
  lat: number;
  lng: number;
  city: string | null;
};

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en",
  "User-Agent": "OutfitPicker/1.0 (https://github.com/outfit-picker-app)",
};

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country_code?: string;
  country?: string;
};

type NominatimHit = {
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimAddress;
};

function formatAddress(address: NominatimAddress): string | null {
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county;
  if (!city) return null;

  const country =
    address.country_code === "gb" || address.country === "United Kingdom"
      ? "UK"
      : address.country_code?.toUpperCase() || address.country;
  const region =
    address.state && address.state !== city ? address.state : null;

  if (region && country && ["US", "CA", "AU"].includes(country)) {
    return `${city}, ${region}, ${country}`;
  }
  return country ? `${city}, ${country}` : city;
}

function toResolved(hit: NominatimHit, fallback: string): ResolvedLocation {
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    city:
      (hit.address ? formatAddress(hit.address) : null) ??
      hit.display_name ??
      fallback,
  };
}

export async function searchCities(
  query: string,
  limit = 5,
): Promise<ResolvedLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${limit}&addressdetails=1&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return [];

    const results = (await res.json()) as NominatimHit[];
    const unique: ResolvedLocation[] = [];
    const seen = new Set<string>();

    for (const hit of results) {
      const location = toResolved(hit, trimmed);
      const key =
        location.city?.toLowerCase() ?? `${location.lat},${location.lng}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(location);
    }

    return unique;
  } catch {
    return [];
  }
}

export async function geocodeCity(
  query: string,
): Promise<
  { ok: true; location: ResolvedLocation } | { ok: false; error: string }
> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a city" };
  }

  try {
    const matches = await searchCities(trimmed, 1);
    const first = matches[0];
    if (!first) {
      return { ok: false, error: "Couldn't find that city. Check the spelling." };
    }
    return { ok: true, location: first };
  } catch {
    return {
      ok: false,
      error: "Couldn't look up that city. Try again in a moment.",
    };
  }
}
