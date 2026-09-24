import React from 'react';
import CivicInteractiveMap from '../components/CivicInteractiveMap';

export default function PublicMapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <CivicInteractiveMap 
        title="Nagar Nigam Jaipur Interactive GeoJSON & Civic Intelligence Map" 
      />
    </div>
  );
}


