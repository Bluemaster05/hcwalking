import { Loc } from "@/app/(tabs)";

export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (x:number) => x * Math.PI / 180;

  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);

  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dlat/2)**2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlon/2)**2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getBearing(startLat: number, startLng: number, endLat: number, endLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(startLat);
  const lat2 = toRad(endLat);
  const dLon = toRad(endLng - startLng);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));

  // Normalize to 0–360
  return (bearing + 360) % 360;
}

export function randomPointInCircle(center: Loc, radiusMeters: number): Loc {
  // Convert meters → degrees
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLong =
    111_320 * Math.cos(center.lat * Math.PI / 180);

  // Random angle 0 → 2π
  const angle = Math.random() * 2 * Math.PI;

  // Random distance with uniform distribution
  const distance = Math.sqrt(Math.random()) * radiusMeters;

  // Offset in degrees
  const dLat = (distance * Math.sin(angle)) / metersPerDegreeLat;
  const dLong = (distance * Math.cos(angle)) / metersPerDegreeLong;

  return {
    lat: center.lat + dLat,
    long: center.long + dLong,
  };
}