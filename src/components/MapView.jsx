import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { AU_CENTER, AU_ZOOM } from '../australia.js';

const BLUE = '#0288d1';
const CORAL = '#ff7a59';
const NAVY = '#0d2b45';

// Vector map pins (no image files needed).
const pinSvg = (fill) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 24 34">
    <path d="M12 .8C5.8.8.8 5.8.8 12c0 8.4 11.2 20.6 11.2 20.6S23.2 20.4 23.2 12C23.2 5.8 18.2.8 12 .8z" fill="${fill}" stroke="#fff" stroke-width="1.6"/>
    <circle cx="12" cy="12" r="4.4" fill="#fff"/>
  </svg>`;
const makePin = (fill, scale = 1) =>
  L.divIcon({ className: 'nv-pin', html: pinSvg(fill), iconSize: [34 * scale, 46 * scale], iconAnchor: [17 * scale, 46 * scale], popupAnchor: [0, -40 * scale] });
const PIN = makePin(BLUE);
const PIN_ACTIVE = makePin(CORAL, 1.15);

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function FitView({ points, circle }) {
  const map = useMap();
  const key = JSON.stringify([points.map((p) => [p.latitude, p.longitude]), circle]);
  useEffect(() => {
    if (circle) map.fitBounds(L.latLng(circle.latitude, circle.longitude).toBounds(circle.km * 2000), { padding: [20, 20] });
    else if (points.length === 0) map.setView(AU_CENTER, AU_ZOOM);
    else if (points.length === 1) map.setView([points[0].latitude, points[0].longitude], 13);
    else map.fitBounds(points.map((p) => [p.latitude, p.longitude]), { padding: [40, 40], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/**
 * points: [{ id, latitude, longitude, title, subtitle, to }]
 * circle: { latitude, longitude, km } - shaded service area
 * userLocation: { lat, lng }
 */
export default function MapView({ points = [], circle, userLocation, activeId, height = 420 }) {
  const all = userLocation ? [...points, { latitude: userLocation.lat, longitude: userLocation.lng }] : points;
  return (
    <div className="map-frame">
      <MapContainer center={AU_CENTER} zoom={AU_ZOOM} style={{ height }} scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <FitView points={all} circle={circle} />
        {circle && (
          <Circle center={[circle.latitude, circle.longitude]} radius={circle.km * 1000}
            pathOptions={{ color: BLUE, weight: 1.5, fillColor: '#4fc3f7', fillOpacity: 0.12 }} />
        )}
        {userLocation && (
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: NAVY, fillOpacity: 1 }}>
            <Popup>Your location</Popup>
          </CircleMarker>
        )}
        {points.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={p.id === activeId ? PIN_ACTIVE : PIN} zIndexOffset={p.id === activeId ? 1000 : 0}>
            {p.title && (
              <Popup>
                <strong>{p.title}</strong>
                {p.subtitle && <><br />{p.subtitle}</>}
                {p.to && <><br /><Link to={p.to}>View</Link></>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
