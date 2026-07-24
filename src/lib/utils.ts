/**
 * Sorts strings naturally, handling numeric parts correctly.
 * Handles prefix priority: BM < RP < RR < RPM
 */
export function sortInstruments<T extends { id: string }>(instruments: T[]): T[] {
  const prefixPriority: Record<string, number> = {
    "BM": 1,
    "RP": 2,
    "RR": 3,
    "RPM": 4,
    "AK": 5,
    "DM": 6,
    "TL": 7
  };

  return [...instruments].sort((a, b) => {
    const idA = a.id.toUpperCase();
    const idB = b.id.toUpperCase();

    // Extract prefix (e.g., "RPM" from "RPM-20")
    const matchA = idA.match(/^([A-Z]+)-/);
    const matchB = idB.match(/^([A-Z]+)-/);

    const prefA = matchA ? matchA[1] : idA;
    const prefB = matchB ? matchB[1] : idB;

    const prioA = prefixPriority[prefA] || 99;
    const prioB = prefixPriority[prefB] || 99;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // If same prefix, sort naturally by the numeric part
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
  });
}
