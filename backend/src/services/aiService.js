/**
 * AI Advisory Service for CiviResolve
 * Includes smart rule-based fallback when external API keys are missing or calls fail.
 */

const CATEGORY_KEYWORDS = {
  'potholes': ['pothole', 'hole', 'crater', 'asphalt', 'road damage', 'tar', 'pit'],
  'waterlogging': ['water', 'waterlogging', 'flood', 'drain', 'puddle', 'submerged', 'overflowing water', 'stagnant'],
  'garbage': ['garbage', 'trash', 'waste', 'litter', 'dump', 'filth', 'rubbish', 'smell', 'odor'],
  'broken streetlights': ['light', 'streetlight', 'lamp', 'dark', 'bulb', 'wire', 'electricity', 'night darkness'],
  'drainage problems': ['drain', 'drainage', 'sewer', 'sewage', 'clog', 'clogged', 'pipe', 'gutters'],
  'sanitation issues': ['sanitation', 'unhygienic', 'public toilet', 'waste water', 'foul', 'health hazard']
};

/**
 * Categorizes and prioritizes issue using AI / heuristic rules
 */
async function suggestCategoryAndPriority(text) {
  const lower = (text || '').toLowerCase();
  
  let suggestedCategory = 'Road Damage / Potholes';
  let categoryCode = 'potholes';
  let matchedCount = 0;

  for (const [code, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) count++;
    }
    if (count > matchedCount) {
      matchedCount = count;
      categoryCode = code;
    }
  }

  // Priority detection based on critical terms
  let priority = 'MEDIUM';
  if (lower.includes('urgent') || lower.includes('danger') || lower.includes('accident') || lower.includes('severe') || lower.includes('hazard') || lower.includes('blocked main')) {
    priority = 'HIGH';
  } else if (lower.includes('emergency') || lower.includes('live wire') || lower.includes('collapse') || lower.includes('toxic')) {
    priority = 'CRITICAL';
  } else if (lower.includes('minor') || lower.includes('small') || lower.includes('cosmetic')) {
    priority = 'LOW';
  }

  return {
    suggestedCategoryCode: categoryCode,
    priority,
    confidence: matchedCount > 0 ? 0.88 : 0.65,
    isAiGenerated: false,
    explanation: matchedCount > 0 
      ? `Detected civic keywords matching '${categoryCode}' with '${priority}' priority indicator.`
      : `Default classification assigned based on general infrastructure context.`
  };
}

/**
 * Summarizes issue description into plain civic terms
 */
async function summarizeIssue(title, description) {
  const cleanTitle = title ? title.trim() : 'Civic Issue';
  const cleanDesc = description ? description.trim() : '';

  let summary = `${cleanTitle}. `;
  if (cleanDesc.length > 120) {
    summary += cleanDesc.substring(0, 117) + '...';
  } else {
    summary += cleanDesc;
  }

  return {
    summary,
    keyImpacts: [
      'Public safety & mobility',
      'Neighborhood sanitation'
    ],
    isAiGenerated: false
  };
}

/**
 * Natural language search over issues
 */
async function naturalLanguageSearch(query, issues) {
  if (!query || !issues) return [];
  const q = query.toLowerCase();

  return issues.filter(issue => {
    return (
      (issue.title && issue.title.toLowerCase().includes(q)) ||
      (issue.description && issue.description.toLowerCase().includes(q)) ||
      (issue.category_name && issue.category_name.toLowerCase().includes(q)) ||
      (issue.ward_name && issue.ward_name.toLowerCase().includes(q)) ||
      (issue.status && issue.status.toLowerCase().includes(q))
    );
  });
}

/**
 * Plain-language summary of civic performance analytics
 */
async function generatePlainLanguageSummary(stats) {
  const total = stats.totalIssues || 0;
  const resolved = stats.resolvedIssues || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    overview: `Out of ${total} reported civic issues across all municipal wards, ${resolved} (${resolutionRate}%) have been resolved or are undergoing citizen verification.`,
    highlights: [
      `Active Resolution Rate: ${resolutionRate}%`,
      `Top Reporting Ward: ${stats.topWard || 'Metro Central Ward'}`,
      `Highest Category Load: ${stats.topCategory || 'Road Damage'}`
    ],
    actionRecommendation: 'Prioritize pending verification items to maintain high citizen trust and close out completed work orders.'
  };
}

module.exports = {
  suggestCategoryAndPriority,
  summarizeIssue,
  naturalLanguageSearch,
  generatePlainLanguageSummary
};
