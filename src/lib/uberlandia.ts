export const UBERLANDIA_CENTER = {
  lat: -18.9113,
  lng: -48.2622,
};

export const UBERLANDIA_BOUNDS = {
  north: -18.74,
  south: -19.16,
  east: -47.93,
  west: -48.54,
};

export function isWithinUberlandia(lat: number, lng: number): boolean {
  return (
    lat <= UBERLANDIA_BOUNDS.north &&
    lat >= UBERLANDIA_BOUNDS.south &&
    lng <= UBERLANDIA_BOUNDS.east &&
    lng >= UBERLANDIA_BOUNDS.west
  );
}
