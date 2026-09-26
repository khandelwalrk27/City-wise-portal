const path = require('path');
const fs = require('fs');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default || require('@turf/boolean-point-in-polygon');
const { point, polygon, multiPolygon } = require('@turf/helpers');
const { getDB } = require('../config/db');

/**
 * Loads ward GeoJSON features from database or fallback file.
 */
async function getWardsGeoJSON() {
  const db = await getDB();
  const dbWards = await db.all('SELECT * FROM wards');
  
  // Load data/wards.geojson for rich properties (zone, parshad details, etc.)
  const filePath = path.join(__dirname, '../../../data/wards.geojson');
  let fileLookup = {};
  if (fs.existsSync(filePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      (raw.features || []).forEach(f => {
        if (f.properties?.code) {
          fileLookup[f.properties.code] = f.properties;
        }
      });
    } catch (e) {
      console.warn('Could not parse wards.geojson fallback:', e.message);
    }
  }
  
  if (dbWards && dbWards.length > 0) {
    const features = dbWards.map(w => {
      let geom;
      try {
        geom = typeof w.boundary_geojson === 'string' ? JSON.parse(w.boundary_geojson) : w.boundary_geojson;
      } catch (e) {
        geom = null;
      }
      const rawProps = fileLookup[w.code] || {};
      const { id: _ignoredWardNumber, ...fileProps } = rawProps;
      return {
        type: 'Feature',
        id: w.id,
        properties: {
          ...fileProps,
          ward_number: rawProps.id || null,
          id: w.id,
          name: w.name,
          code: w.code,
          description: w.description,
          population: w.population,
          area_sq_km: w.area_sq_km,
          zone: fileProps.zone || 'Jaipur Municipal Corporation',
          parshad_name: fileProps.parshad_name || 'Elected Ward Parshad',
          parshad_phone: fileProps.parshad_phone || '',
          party: fileProps.party || 'Independent'
        },
        geometry: geom
      };
    }).filter(f => f.geometry);

    return {
      type: 'FeatureCollection',
      features
    };
  }

  // Fallback to data/wards.geojson
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }

  return { type: 'FeatureCollection', features: [] };
}

/**
 * Point-in-polygon GeoJSON detection
 * turf point format: [longitude, latitude]
 */
async function getWardFromCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { ward: null, isManual: false, error: 'Invalid coordinates' };
  }

  const geojson = await getWardsGeoJSON();
  const pt = point([longitude, latitude]);

  for (const feature of geojson.features) {
    if (!feature.geometry) continue;

    try {
      if (booleanPointInPolygon(pt, feature)) {
        let matchedId = feature.properties.id || feature.id;
        const code = feature.properties.code;
        try {
          const db = await getDB();
          const dbMatch = await db.get('SELECT id, name, code, description FROM wards WHERE code = ? OR id = ?', [code, matchedId]);
          if (dbMatch) {
            return {
              ward: {
                id: dbMatch.id,
                name: dbMatch.name,
                code: dbMatch.code,
                description: dbMatch.description
              },
              isManual: false
            };
          }
        } catch (e) {
          // ignore fallback
        }
        return {
          ward: {
            id: matchedId,
            name: feature.properties.name,
            code: feature.properties.code,
            description: feature.properties.description
          },
          isManual: false
        };
      }
    } catch (err) {
      console.error(`Error checking polygon for feature ${feature.id}:`, err);
    }
  }

  return { ward: null, isManual: true, message: 'Coordinates fall outside defined ward boundaries' };
}

module.exports = {
  getWardsGeoJSON,
  getWardFromCoordinates
};
