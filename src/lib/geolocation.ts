// Mauá, SP, Brazil coordinates for LSP64
const TARGET_LOCATION = {
  latitude: -23.6675,
  longitude: -46.4608,
};

const MAX_DISTANCE_METERS = 500; // 500 meters radius

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in meters.
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Verifies if a given location is within the specified geofence.
 * @param latitude The user's current latitude.
 * @param longitude The user's current longitude.
 * @returns An object indicating if the user is in range and their distance from the target.
 */
export function verifyLocation(latitude: number, longitude: number): { isInRange: boolean, distance: number } {
  const distance = calculateDistance(
    latitude,
    longitude,
    TARGET_LOCATION.latitude,
    TARGET_LOCATION.longitude
  );

  return {
    isInRange: distance <= MAX_DISTANCE_METERS,
    distance: Math.round(distance)
  };
}
