/**
 * Returns the tracking URL on APRS.fi for a given callsign
 *
 * @param {string} callsign The callsign to track
 * @returns {string}
 */
export function getAprsFiCallsignTrackingUrl(callsign) {
  return `https://aprs.fi/#!z=12&call=a%2F${callsign}`;
}
