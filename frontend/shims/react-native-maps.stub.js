/**
 * Metro resolves `react-native-maps` to this file on **web** only.
 * The real package is native-only and cannot load in the web bundle.
 * Explore on web uses `explore.web.tsx` (Leaflet); this stub exists so
 * route discovery / shared graphs never crash when `explore.native.tsx` is parsed.
 */
const React = require('react');

function noop() {
  return null;
}

function MapView() {
  return null;
}

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = noop;
module.exports.Callout = noop;
module.exports.Circle = noop;
module.exports.Heatmap = noop;
module.exports.Polygon = noop;
module.exports.Polyline = noop;
module.exports.UrlTile = noop;
module.exports.WMSTile = noop;
module.exports.LocalTile = noop;
module.exports.Geojson = noop;
