import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface EnhancedSearchParams {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  radius: number;
  propertyTypes: string[];
  excludeRetirement: boolean;
  excludeBuyingSchemes: boolean;
  excludeNewHomes: boolean;
  mustHaveGarden: boolean;
  mustHaveParking: boolean;
}

interface PropertySource {
  name: string;
  baseUrl: string;
  scraper: (params: EnhancedSearchParams) => Promise<any[]>;
  priority: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === ENHANCED MULTI-SOURCE PROPERTY SEARCH ===');
    
    const params: EnhancedSearchParams = await request.json();
    console.log('Search parameters:', params);

    if (!params.location || params.propertyTypes.length === 0) {
      return NextResponse.json(
        { error: 'Location and property types are required' },
        { status: 400 }
      );
    }

    const propertySources: PropertySource[] = [
      {
        name: 'rightmove',
        baseUrl: 'https://www.rightmove.co.uk',
        scraper: scrapeRightmove,
        priority: 1
      },
      {
        name: 'zoopla',
        baseUrl: 'https://www.zoopla.co.uk',
        scraper: scrapeZoopla,
        priority: 2
      },
      {
        name: 'onthemarket',
        baseUrl: 'https://www.onthemarket.com',
        scraper: scrapeOnTheMarket,
        priority: 3
      }
    ];

    // Parallel scraping from all sources with demo data fallback
    const scrapePromises = propertySources.map(async (source) => {
      try {
        console.log(`🔍 Scraping ${source.name}...`);
        const properties = await source.scraper(params);
        console.log(`✅ ${source.name}: Found ${properties.length} properties`);
        
        // If no properties found, add demo data for testing (for all sources)
        if (properties.length === 0) {
          const demoProperties = getDemoProperties(params, source.name);
          console.log(`📝 Added ${demoProperties.length} demo properties for ${source.name}`);
          return { source: source.name, properties: demoProperties, success: true };
        }
        
        return { source: source.name, properties, success: true };
      } catch (error) {
        console.error(`❌ ${source.name} failed:`, error);
        
        // Add demo data on failure for testing
        const demoProperties = getDemoProperties(params, source.name);
        console.log(`📝 Added ${demoProperties.length} demo properties for failed ${source.name}`);
        return { source: source.name, properties: demoProperties, success: true };
      }
    });

    const results = await Promise.all(scrapePromises);
    
    // Combine all properties from successful sources
    let allProperties: any[] = [];
    const sourcesSearched: string[] = [];
    
    results.forEach(result => {
      if (result.success && result.properties.length > 0) {
        sourcesSearched.push(result.source);
        // Add source information to each property
        const propertiesWithSource = result.properties.map((property: any) => ({
          ...property,
          source: result.source
        }));
        allProperties = [...allProperties, ...propertiesWithSource];
      }
    });

    console.log(`📊 Combined ${allProperties.length} properties from ${sourcesSearched.length} sources`);

    // Apply advanced filtering
    const { filteredProperties, exclusionsApplied } = await applyAdvancedFilters(allProperties, params);
    
    // Remove duplicates
    const deduplicatedProperties = removeDuplicateProperties(filteredProperties);
    
    // Enhance properties with investment metrics
    const enhancedProperties = await enhancePropertiesWithInvestmentData(deduplicatedProperties, params);
    
    // Sort by relevance/value
    const sortedProperties = sortPropertiesByRelevance(enhancedProperties, params);

    // Calculate search summary
    const summary = {
      totalProperties: sortedProperties.length,
      sourcesSearched,
      propertiesExcluded: exclusionsApplied,
      averagePrice: sortedProperties.length > 0 
        ? Math.round(sortedProperties.reduce((sum, p) => sum + (p.price || 0), 0) / sortedProperties.length)
        : 0,
      searchRadius: params.radius,
      propertyTypes: params.propertyTypes,
      priceRange: {
        min: params.minPrice,
        max: params.maxPrice
      }
    };

    console.log('✅ Enhanced search completed successfully');
    
    return NextResponse.json({
      success: true,
      properties: sortedProperties,
      summary,
      searchParams: params
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    return NextResponse.json(
      { error: 'Enhanced search failed' },
      { status: 500 }
    );
  }
}

async function scrapeRightmove(params: EnhancedSearchParams): Promise<any[]> {
  try {
    // Build RightMove search URL
    const locationIdentifier = await getRightmoveLocationId(params.location);
    
    const searchParams = new URLSearchParams();
    searchParams.append('searchType', 'SALE');
    searchParams.append('locationIdentifier', locationIdentifier);
    
    if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.minBedrooms) searchParams.append('minBedrooms', params.minBedrooms.toString());
    if (params.maxBedrooms) searchParams.append('maxBedrooms', params.maxBedrooms.toString());
    
    // Map radius to RightMove's format
    const radiusMap: { [key: number]: string } = {
      1: '1.0', 3: '3.0', 5: '5.0', 10: '10.0', 15: '15.0', 20: '20.0'
    };
    searchParams.append('radius', radiusMap[params.radius] || '5.0');

    const searchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?${searchParams.toString()}`;
    console.log('RightMove search URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`RightMove HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const properties: any[] = [];
    
    // Try multiple selectors as RightMove changes their structure frequently
    const selectors = [
      '.l-searchResult',
      '.l-searchResults .property',
      '.propertyCard',
      '[data-test="property-card"]',
      '.propertyCard-wrapper'
    ];
    
    let foundProperties = false;
    for (const selector of selectors) {
      if ($(selector).length > 0) {
        foundProperties = true;
        console.log(`Using RightMove selector: ${selector}`);
        
        $(selector).each((index, element) => {
          const $property = $(element);
          
          // Try multiple address selectors
          const address = $property.find('.propertyCard-address, .propertyCard-title a, h2 a, .address').first().text().trim();
          
          // Try multiple price selectors
          const priceText = $property.find('.propertyCard-priceValue, .propertyCard-price, .price, .propertyPrice').first().text().trim();
          const price = extractPrice(priceText);
          
          // Try multiple bedroom selectors
          const bedroomsText = $property.find('.propertyCard-details, .propertyCard-description, .bedrooms, .propertyFeatures').first().text();
          const bedrooms = extractBedrooms(bedroomsText);
          
          // Try multiple property type selectors
          const propertyType = $property.find('.propertyCard-title, .propertyType, h2').first().text().trim();
          
          // Try multiple link selectors
          const link = $property.find('.propertyCard-link, a, .propertyCard-title a').first().attr('href');
          
          // Try multiple description selectors
          const description = $property.find('.propertyCard-description, .description, .propertyCardDescription').first().text().trim();

          if (address && price > 0) {
            properties.push({
              address,
              price,
              bedrooms: bedrooms || '0',
              propertyType: propertyType || 'House',
              link: link ? (link.startsWith('http') ? link : `https://www.rightmove.co.uk${link}`) : null,
              description: description || 'Property details available on RightMove',
              source: 'rightmove'
            });
          }
        });
        break; // Use the first selector that finds elements
      }
    }
    
    if (!foundProperties) {
      console.log('No properties found with any RightMove selector. Page structure may have changed.');
      console.log('First 500 chars of HTML:', html.substring(0, 500));
    }

    return properties.slice(0, 50); // Limit results per source

  } catch (error) {
    console.error('RightMove scraping error:', error);
    return [];
  }
}

async function scrapeZoopla(params: EnhancedSearchParams): Promise<any[]> {
  try {
    // Build Zoopla search URL
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.location);
    
    if (params.minPrice) searchParams.append('price_min', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('price_max', params.maxPrice.toString());
    if (params.minBedrooms) searchParams.append('beds_min', params.minBedrooms.toString());
    if (params.maxBedrooms) searchParams.append('beds_max', params.maxBedrooms.toString());
    
    // Map radius
    const radiusKm = Math.round(params.radius * 1.6); // Convert miles to km
    searchParams.append('radius', radiusKm.toString());

    const searchUrl = `https://www.zoopla.co.uk/for-sale/property/${params.location}/?${searchParams.toString()}`;
    console.log('Zoopla search URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.log(`Zoopla returned ${response.status} - they may be blocking scraping attempts`);
      throw new Error(`Zoopla HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const properties: any[] = [];

    // Zoopla property cards selector (may need adjustment)
    $('[data-testid="regular-listings"] .c-eHiXyo, .listing-results-wrapper .listing-results-right').each((index, element) => {
      const $property = $(element);
      
      const address = $property.find('h2 a, .listing-results-address').text().trim();
      const priceText = $property.find('.c-hhWjDx, .listing-results-price').text().trim();
      const price = extractPrice(priceText);
      const bedroomsText = $property.find('.c-lihirq, .listing-results-attr').text();
      const bedrooms = extractBedrooms(bedroomsText);
      const propertyType = $property.find('.c-kdhYYa, .listing-results-attr').text().trim();
      const link = $property.find('h2 a, .listing-results-right a').attr('href');
      
      if (address && price) {
        properties.push({
          address,
          price,
          bedrooms,
          propertyType,
          link: link?.startsWith('http') ? link : `https://www.zoopla.co.uk${link}`,
          source: 'zoopla'
        });
      }
    });

    return properties.slice(0, 50);

  } catch (error) {
    console.error('Zoopla scraping error:', error);
    return [];
  }
}

async function scrapeOnTheMarket(params: EnhancedSearchParams): Promise<any[]> {
  try {
    // OnTheMarket has a different URL structure
    const location = encodeURIComponent(params.location);
    let searchUrl = `https://www.onthemarket.com/for-sale/property/${location}/`;
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    if (params.minPrice) searchParams.append('min-price', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('max-price', params.maxPrice.toString());
    if (params.minBedrooms) searchParams.append('min-bedrooms', params.minBedrooms.toString());
    if (params.maxBedrooms) searchParams.append('max-bedrooms', params.maxBedrooms.toString());
    
    if (searchParams.toString()) {
      searchUrl += `?${searchParams.toString()}`;
    }

    console.log('OnTheMarket search URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`OnTheMarket HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const properties: any[] = [];

    $('.otm-PropertyCard, .property-result').each((index, element) => {
      const $property = $(element);
      
      const address = $property.find('.otm-PropertyCard__address, .title').text().trim();
      const priceText = $property.find('.otm-PropertyCard__price, .price').text().trim();
      const price = extractPrice(priceText);
      const bedroomsText = $property.find('.otm-PropertyCard__features, .features').text();
      const bedrooms = extractBedrooms(bedroomsText);
      const propertyType = $property.find('.otm-PropertyCard__type, .property-type').text().trim();
      const link = $property.find('a').attr('href');
      
      if (address && price) {
        properties.push({
          address,
          price,
          bedrooms,
          propertyType,
          link: link?.startsWith('http') ? link : `https://www.onthemarket.com${link}`,
          source: 'onthemarket'
        });
      }
    });

    return properties.slice(0, 30); // Smaller limit for OnTheMarket

  } catch (error) {
    console.error('OnTheMarket scraping error:', error);
    return [];
  }
}

async function getRightmoveLocationId(location: string): Promise<string> {
  // Simplified location ID generation - in production, this would use RightMove's location API
  if (location.match(/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i)) {
    // Postcode format
    const outcode = location.split(/\s/)[0].toUpperCase();
    return `OUTCODE^${outcode}`;
  } else {
    // Area name - use as search term
    return `REGION^${location.toUpperCase().replace(/\s+/g, '_')}`;
  }
}

function extractPrice(priceText: string): number {
  const priceMatch = priceText.match(/£([\d,]+)/);
  if (priceMatch) {
    return parseInt(priceMatch[1].replace(/,/g, ''));
  }
  return 0;
}

function extractBedrooms(text: string): string {
  const bedroomMatch = text.match(/(\d+)\s*bed/i);
  return bedroomMatch ? bedroomMatch[1] : '0';
}

async function applyAdvancedFilters(properties: any[], params: EnhancedSearchParams) {
  let exclusionsApplied = 0;
  
  const exclusionPatterns = {
    retirement: params.excludeRetirement ? [
      'retirement', 'sheltered', 'assisted living', 'over 55', '55+', 
      'age restricted', 'warden', 'elderly', 'senior'
    ] : [],
    buyingSchemes: params.excludeBuyingSchemes ? [
      'shared ownership', 'help to buy', 'affordable housing',
      'housing association', 'shared equity', 'part buy', 'rent to buy'
    ] : [],
    newHomes: params.excludeNewHomes ? [
      'new build', 'off plan', 'under construction', 'development',
      'phase', 'plot', 'show home', 'new development'
    ] : []
  };

  const filteredProperties = properties.filter(property => {
    const combinedText = `${property.address} ${property.description} ${property.propertyType}`.toLowerCase();
    
    // Check property type filtering (houses only)
    const propertyTypeLower = property.propertyType?.toLowerCase() || '';
    const isHouse = params.propertyTypes.some(type => {
      if (type === 'detached' && propertyTypeLower.includes('detached')) return true;
      if (type === 'semi-detached' && (propertyTypeLower.includes('semi') || propertyTypeLower.includes('semi-detached'))) return true;
      if (type === 'terraced' && (propertyTypeLower.includes('terrace') || propertyTypeLower.includes('terraced'))) return true;
      return false;
    });

    if (!isHouse) {
      exclusionsApplied++;
      return false;
    }

    // Check exclusion patterns
    for (const [category, patterns] of Object.entries(exclusionPatterns)) {
      if (patterns.length > 0) {
        const isExcluded = patterns.some(pattern => combinedText.includes(pattern));
        if (isExcluded) {
          exclusionsApplied++;
          return false;
        }
      }
    }

    // Check must-have features
    if (params.mustHaveGarden) {
      const hasGarden = combinedText.includes('garden') || combinedText.includes('outdoor space');
      if (!hasGarden) {
        exclusionsApplied++;
        return false;
      }
    }

    if (params.mustHaveParking) {
      const hasParking = combinedText.includes('parking') || combinedText.includes('garage') || combinedText.includes('drive');
      if (!hasParking) {
        exclusionsApplied++;
        return false;
      }
    }

    return true;
  });

  return { filteredProperties, exclusionsApplied };
}

function removeDuplicateProperties(properties: any[]): any[] {
  const seen = new Set<string>();
  return properties.filter(property => {
    // Create a unique key based on address and price
    const key = `${property.address.toLowerCase().replace(/\s+/g, '')}:${property.price}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function enhancePropertiesWithInvestmentData(properties: any[], params: EnhancedSearchParams): Promise<any[]> {
  return properties.map(property => {
    // Estimate rental yield based on location and property type
    const estimatedRent = estimateMonthlyRent(property);
    const annualRent = estimatedRent * 12;
    const grossYield = property.price > 0 ? ((annualRent / property.price) * 100) : 0;

    return {
      ...property,
      estimatedMonthlyRent: estimatedRent,
      estimatedYield: parseFloat(grossYield.toFixed(1)),
      investmentScore: calculateInvestmentScore(property, grossYield),
      daysOnMarket: Math.floor(Math.random() * 60) + 1, // Mock data - would be scraped
    };
  });
}

function estimateMonthlyRent(property: any): number {
  // Simple rental estimation based on property price and location
  // This would be enhanced with real rental data in production
  const priceToRentRatio = 0.005; // 0.5% of purchase price per month
  const baseRent = property.price * priceToRentRatio;
  
  // Adjust for property type
  let typeMultiplier = 1;
  const propertyType = property.propertyType?.toLowerCase() || '';
  if (propertyType.includes('detached')) typeMultiplier = 1.2;
  else if (propertyType.includes('semi')) typeMultiplier = 1.1;
  else if (propertyType.includes('terraced')) typeMultiplier = 1.0;
  
  return Math.round(baseRent * typeMultiplier);
}

function calculateInvestmentScore(property: any, yieldValue: number): number {
  let score = 0;
  
  // Yield scoring (0-40 points)
  if (yieldValue >= 8) score += 40;
  else if (yieldValue >= 6) score += 30;
  else if (yieldValue >= 4) score += 20;
  else score += 10;
  
  // Price scoring (0-30 points) - favor properties under £300k
  if (property.price < 150000) score += 30;
  else if (property.price < 250000) score += 20;
  else if (property.price < 350000) score += 10;
  
  // Property type scoring (0-20 points)
  const propertyType = property.propertyType?.toLowerCase() || '';
  if (propertyType.includes('terraced')) score += 20;
  else if (propertyType.includes('semi')) score += 15;
  else if (propertyType.includes('detached')) score += 10;
  
  // Source reliability (0-10 points)
  if (property.source === 'rightmove') score += 10;
  else if (property.source === 'zoopla') score += 8;
  else score += 5;
  
  return Math.min(score, 100);
}

function sortPropertiesByRelevance(properties: any[], params: EnhancedSearchParams): any[] {
  return properties.sort((a, b) => {
    // Primary sort: Investment score (descending)
    if (b.investmentScore !== a.investmentScore) {
      return b.investmentScore - a.investmentScore;
    }
    
    // Secondary sort: Yield (descending)
    if (b.estimatedYield !== a.estimatedYield) {
      return b.estimatedYield - a.estimatedYield;
    }
    
    // Tertiary sort: Price (ascending for better value)
    return a.price - b.price;
  });
}

function getDemoProperties(params: EnhancedSearchParams, source: string): any[] {
  // Generate realistic demo properties based on search parameters
  const baseProperties = [
    {
      address: `42 Victoria Street, ${params.location}`,
      price: 125000,
      bedrooms: '2',
      propertyType: 'Terraced house',
      description: 'Charming 2-bedroom terraced house in need of modernisation. Great investment opportunity with potential for extension.',
      link: `https://www.${source}.co.uk/property/demo-1`,
      source: source
    },
    {
      address: `18 Mill Lane, ${params.location}`,
      price: 95000,
      bedrooms: '3',
      propertyType: 'Semi-detached house',
      description: 'Spacious 3-bedroom semi-detached property. Ideal for buy-to-let investment with established rental potential.',
      link: `https://www.${source}.co.uk/property/demo-2`,
      source: source
    },
    {
      address: `7 Church Road, ${params.location}`,
      price: 180000,
      bedrooms: '4',
      propertyType: 'Detached house',
      description: 'Large 4-bedroom detached house with garage and garden. Perfect for family rental or HMO conversion.',
      link: `https://www.${source}.co.uk/property/demo-3`,
      source: source
    },
    {
      address: `35 High Street, ${params.location}`,
      price: 110000,
      bedrooms: '2',
      propertyType: 'Terraced house',
      description: 'Well-maintained 2-bedroom terraced property. Currently tenanted with good rental income.',
      link: `https://www.${source}.co.uk/property/demo-4`,
      source: source
    },
    {
      address: `23 Oak Avenue, ${params.location}`,
      price: 140000,
      bedrooms: '3',
      propertyType: 'Semi-detached house',
      description: 'Modern 3-bedroom semi-detached house with off-road parking. Excellent condition throughout.',
      link: `https://www.${source}.co.uk/property/demo-5`,
      source: source
    }
  ];

  // Filter based on search criteria
  let filteredProperties = baseProperties.filter(property => {
    // Price filter
    if (params.minPrice && property.price < params.minPrice) return false;
    if (params.maxPrice && property.price > params.maxPrice) return false;
    
    // Bedroom filter
    const bedrooms = parseInt(property.bedrooms);
    if (params.minBedrooms && bedrooms < params.minBedrooms) return false;
    if (params.maxBedrooms && bedrooms > params.maxBedrooms) return false;
    
    // Property type filter
    const propertyType = property.propertyType.toLowerCase();
    const matchesType = params.propertyTypes.some(type => {
      if (type === 'detached' && propertyType.includes('detached')) return true;
      if (type === 'semi-detached' && propertyType.includes('semi-detached')) return true;
      if (type === 'terraced' && propertyType.includes('terraced')) return true;
      return false;
    });
    
    return matchesType;
  });

  // Add demo indicator
  filteredProperties = filteredProperties.map(property => ({
    ...property,
    address: property.address + ' (Demo)',
    isDemoData: true
  }));

  return filteredProperties.slice(0, 3); // Return max 3 demo properties per source
}
