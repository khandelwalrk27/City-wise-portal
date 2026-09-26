// Authentic Jaipur Civic Images for all categories
export const CIVIC_CATEGORY_IMAGES = {
  potholes: {
    report: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    name: 'Road Damage & Potholes'
  },
  waterlogging: {
    report: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    name: 'Waterlogging & Flooding'
  },
  garbage: {
    report: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    name: 'Garbage & Solid Waste'
  },
  streetlights: {
    report: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    name: 'Streetlight Infrastructure'
  },
  drainage: {
    report: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
    name: 'Drainage & Sewage Overflow'
  },
  sanitation: {
    report: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    name: 'Public Sanitation'
  },
  bins: {
    report: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    name: 'Dumpster Overflow'
  },
  pavements: {
    report: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80',
    resolution: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    name: 'Pavements & Footpaths'
  }
};

/**
 * Returns a high-definition relevant civic photo for any issue thumbnail
 */
export function getCivicThumbnail(issue) {
  if (issue?.primary_image && typeof issue.primary_image === 'string' && issue.primary_image.trim()) {
    return issue.primary_image;
  }
  const text = `${issue?.category_name || ''} ${issue?.title || ''} ${issue?.category_code || ''} ${issue?.description || ''}`.toLowerCase();
  
  if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
    return CIVIC_CATEGORY_IMAGES.potholes.report;
  }
  if (text.includes('water') || text.includes('flood') || text.includes('rain') || text.includes('log')) {
    return CIVIC_CATEGORY_IMAGES.waterlogging.report;
  }
  if (text.includes('garbage') || text.includes('dump') || text.includes('waste') || text.includes('trash')) {
    return CIVIC_CATEGORY_IMAGES.garbage.report;
  }
  if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('pole')) {
    return CIVIC_CATEGORY_IMAGES.streetlights.report;
  }
  if (text.includes('drain') || text.includes('sewer') || text.includes('nallah') || text.includes('sewage')) {
    return CIVIC_CATEGORY_IMAGES.drainage.report;
  }
  if (text.includes('bin') || text.includes('hopper')) {
    return CIVIC_CATEGORY_IMAGES.bins.report;
  }
  if (text.includes('pavement') || text.includes('footpath') || text.includes('paver') || text.includes('tile')) {
    return CIVIC_CATEGORY_IMAGES.pavements.report;
  }
  
  return CIVIC_CATEGORY_IMAGES.potholes.report;
}

/**
 * Returns a resolution proof photo if available, or a category-specific resolution image
 */
export function getCivicResolutionImage(issue) {
  const text = `${issue?.category_name || ''} ${issue?.title || ''} ${issue?.category_code || ''} ${issue?.description || ''}`.toLowerCase();
  
  if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
    return CIVIC_CATEGORY_IMAGES.potholes.resolution;
  }
  if (text.includes('water') || text.includes('flood') || text.includes('rain') || text.includes('log')) {
    return CIVIC_CATEGORY_IMAGES.waterlogging.resolution;
  }
  if (text.includes('garbage') || text.includes('dump') || text.includes('waste')) {
    return CIVIC_CATEGORY_IMAGES.garbage.resolution;
  }
  if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('pole')) {
    return CIVIC_CATEGORY_IMAGES.streetlights.resolution;
  }
  if (text.includes('drain') || text.includes('sewer') || text.includes('nallah')) {
    return CIVIC_CATEGORY_IMAGES.drainage.resolution;
  }
  if (text.includes('pavement') || text.includes('footpath') || text.includes('paver')) {
    return CIVIC_CATEGORY_IMAGES.pavements.resolution;
  }
  
  return CIVIC_CATEGORY_IMAGES.potholes.resolution;
}
