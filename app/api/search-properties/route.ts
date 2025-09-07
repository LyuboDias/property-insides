import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface PropertySearchParams {
  location: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  radius?: string;
  propertyType?: string;
  offset?: number;
  limit?: number;
}

interface PropertyResult {
  id: string;
  address: string;
  title: string; // Street and city (e.g., "Anlaby Street, Bradford")
  price: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  link: string;
  images: string[];
  description: string;
  agent: string;
}

/**
 * Searches for properties on RightMove based on provided criteria
 */
export async function POST(req: NextRequest) {
  try {
    const params: PropertySearchParams = await req.json();
    
    if (!params.location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    console.log('=== Starting RightMove Search Process ===');
    console.log('Search params:', params);

    // Step 1: Get location identifier from RightMove
    const locationData = await getLocationIdentifier(params.location);
    if (!locationData) {
      return NextResponse.json({ error: 'Could not find location on RightMove' }, { status: 400 });
    }

    console.log('Location data:', locationData);

    // Step 2: Build the final search URL with all parameters
    const searchUrl = buildRightMoveFindUrl(params, locationData);
    console.log('Final search URL:', searchUrl);
    
    // Step 3: Fetch the search results page
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      }
    });

    if (!response.ok) {
      console.error('RightMove fetch failed:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `Failed to fetch search results: ${response.status} ${response.statusText}` 
      }, { status: 500 });
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    const title = html.includes('<title>') ? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] : 'No title found';
    console.log('HTML title check:', title);
    
    // Debug: If we get an error page, let's analyze it
    if (title && (title.includes("couldn't find") || title.includes("error")) || html.length < 200000) {
      console.log('=== ERROR PAGE DETECTED ===');
      console.log('HTML preview (first 1000 chars):', html.substring(0, 1000));
      console.log('Search URL was:', searchUrl);
      
      // Try a simpler URL without property type filters
      if (params.propertyType) {
        console.log('Retrying without property type filter...');
        const simpleParams = { ...params };
        delete simpleParams.propertyType;
        const simpleUrl = buildRightMoveFindUrl(simpleParams, locationData);
        console.log('Trying simpler URL:', simpleUrl);
      }
    }
    
    // Get pagination parameters with defaults
    const offset = params.offset || 0;
    const limit = params.limit || 15;
    
    const result = extractPropertiesFromHtml(html, offset, limit);
    console.log('=== Extraction Complete ===');
    console.log('Total properties found:', result.totalFound);
    console.log('Properties returned:', result.properties.length);

    return NextResponse.json({
      success: true,
      properties: result.properties,
      totalFound: result.totalFound,
      hasMore: (offset + limit) < result.totalFound,
      currentOffset: offset,
      limit: limit,
      searchParams: params,
      locationData,
      debugInfo: {
        url: searchUrl,
        htmlLength: html.length,
        locationIdentifier: locationData.identifier
      }
    });

  } catch (error: any) {
    console.error('Property search error:', error);
    return NextResponse.json({ 
      error: error.message || 'Search failed',
      stack: error.stack
    }, { status: 500 });
  }
}

/**
 * Gets location identifier from RightMove for a given location
 */
async function getLocationIdentifier(location: string): Promise<{identifier: string, displayName: string} | null> {
  try {
    console.log('Getting location identifier for:', location);
    
    // Try to simulate the location lookup process
    // For now, we'll create a basic mapping for common locations
    // In a production system, this would call RightMove's location API
    const locationMap: Record<string, {identifier: string, displayName: string}> = {
      'leeds': { identifier: 'REGION^787', displayName: 'Leeds, West Yorkshire' },
      'london': { identifier: 'REGION^87490', displayName: 'London' },
      'manchester': { identifier: 'REGION^775', displayName: 'Manchester' },
      'birmingham': { identifier: 'REGION^60', displayName: 'Birmingham' },
      'liverpool': { identifier: 'REGION^773', displayName: 'Liverpool' },
      'bristol': { identifier: 'REGION^61', displayName: 'Bristol' },
      'glasgow': { identifier: 'REGION^1649', displayName: 'Glasgow' },
      'edinburgh': { identifier: 'REGION^1623', displayName: 'Edinburgh' },
      'cardiff': { identifier: 'REGION^1649', displayName: 'Cardiff' },
    };
    
    const locationKey = location.toLowerCase().trim();
    const locationData = locationMap[locationKey];
    
    if (locationData) {
      console.log('Found location mapping:', locationData);
      return locationData;
    }
    
    // If not found in our mapping, try to use the location as-is
    // This might work for some postcodes and specific areas
    console.log('Location not found in mapping, using as-is');
    return {
      identifier: `OUTCODE^${location.toUpperCase()}`,
      displayName: location
    };
    
  } catch (error) {
    console.error('Error getting location identifier:', error);
    return null;
  }
}

/**
 * Builds the final RightMove find URL with all parameters
 */
function buildRightMoveFindUrl(params: PropertySearchParams, locationData: {identifier: string, displayName: string}): string {
  const baseUrl = 'https://www.rightmove.co.uk/property-for-sale/find.html';
  const searchParams = new URLSearchParams();
  
  // Core location parameters (required)
  searchParams.set('searchLocation', locationData.displayName);
  searchParams.set('locationIdentifier', locationData.identifier);
  searchParams.set('useLocationIdentifier', 'true');
  
  // Price filters
  if (params.minPrice) {
    searchParams.set('minPrice', params.minPrice);
  }
  
  if (params.maxPrice) {
    searchParams.set('maxPrice', params.maxPrice);
  }
  
  // Bedroom filters
  if (params.bedrooms && params.bedrooms !== '') {
    searchParams.set('minBedrooms', params.bedrooms);
  }
  
  // Radius filter
  if (params.radius) {
    const radiusMiles = parseFloat(params.radius);
    // RightMove uses specific radius values
    if (radiusMiles <= 0.25) searchParams.set('radius', '0.0'); // This area only
    else if (radiusMiles <= 0.5) searchParams.set('radius', '0.25');
    else if (radiusMiles <= 1) searchParams.set('radius', '0.5');
    else if (radiusMiles <= 3) searchParams.set('radius', '1.0');
    else if (radiusMiles <= 5) searchParams.set('radius', '3.0');
    else if (radiusMiles <= 10) searchParams.set('radius', '5.0');
    else if (radiusMiles <= 15) searchParams.set('radius', '10.0');
    else if (radiusMiles <= 20) searchParams.set('radius', '15.0');
    else if (radiusMiles <= 30) searchParams.set('radius', '20.0');
    else searchParams.set('radius', '40.0');
  }
  
  // Property type filter  
  if (params.propertyType && params.propertyType !== '') {
    if (params.propertyType === 'Houses') {
      // For "Houses", let's try without propertyTypes filter to get all house types
      // RightMove might not support comma-separated values
      console.log('Houses filter selected - searching all property types');
    } else {
      // Map individual property types to RightMove property type codes
      const propertyTypeMap: { [key: string]: string } = {
        'Flat': 'flats',
        'Terraced': 'terraced-houses',
        'Semi Detached House': 'semi-detached-houses', 
        'Detached House': 'detached-houses',
        'Bungalow': 'bungalows',
        'Apartment': 'flats',
        'Town House': 'terraced-houses',
        'Maisonette': 'flats'
      };
      
      const rightMovePropertyType = propertyTypeMap[params.propertyType];
      if (rightMovePropertyType) {
        searchParams.set('propertyTypes', rightMovePropertyType);
        console.log('Property type filter:', rightMovePropertyType);
      }
    }
  }
  
  // Include sold STC properties
  searchParams.set('_includeSSTC', 'on');
  
  const finalUrl = `${baseUrl}?${searchParams.toString()}`;
  console.log('Final URL parameters:', Object.fromEntries(searchParams));
  
  return finalUrl;
}

/**
 * Extracts property listings from RightMove search results HTML
 */
function extractPropertiesFromHtml(html: string, offset: number = 0, limit: number = 15): { properties: PropertyResult[], totalFound: number } {
  const $ = cheerio.load(html);
  const properties: PropertyResult[] = [];
  
  // Quick structure check for debugging
  console.log('HTML loaded, extracting properties...');
  
  // RightMove uses various selectors for property listings - updated for current structure
  const propertySelectors = [
    '.l-searchResult',
    '.propertyCard', 
    '.propertyCard-wrapper',
    '.propertyCard-details',
    '[data-test="property-result"]',
    '.property-result',
    '.searchResult',
    '.search-result',
    '[data-test="search-result"]',
    '.propertyCard-content',
    'div[id*="property-"]',
    'article'
  ];
  
  let propertyElements = $();
  
  // Try different selectors until we find property listings
  for (const selector of propertySelectors) {
    propertyElements = $(selector);
    if (propertyElements.length > 0) {
      console.log(`Using selector "${selector}": found ${propertyElements.length} elements`);
      break;
    }
  }
  
  // If no specific property cards found, try finding any links with property URLs
  if (propertyElements.length === 0) {
    propertyElements = $('a[href*="/properties/"]');
    if (propertyElements.length === 0) {
      // Try to find any structured property containers
      const possibleContainers = $('div').filter((i, el) => {
        const className = $(el).attr('class') || '';
        return className.includes('property') || className.includes('card') || className.includes('result');
      });
      if (possibleContainers.length > 0) {
        propertyElements = possibleContainers;
      }
    }
    console.log(`Fallback: found ${propertyElements.length} property elements`);
  }
  
  propertyElements.each((index, element) => {
    try {
      const $property = $(element);
      
      // For property links, get the parent container
      let $container = $property;
      if ($property.is('a')) {
        $container = $property.closest('div, article, section').length ? 
                     $property.closest('div, article, section') : $property.parent();
      }
      
      // Extract property details using multiple possible selectors
      const address = extractText($container, [
        '[data-test="property-title"]',
        '.propertyCard-address', 
        '.propertyCard-title',
        '.propertyCard-details h2',
        '.propertyCard-content h2',
        'h2 a',
        'h2',
        'h3', 
        '.address',
        '.property-title',
        'a[href*="/properties/"]'
      ]) || extractAddressFromLink($container);
      
      const price = extractText($container, [
        '[data-test="property-price"]',
        '.propertyCard-priceValue',
        '.propertyCard-price',
        '.propertyCard-section--price',
        '.price',
        '.property-price',
        '.displayPrice',
        '[data-test="price"]',
        'span[data-test="price"]',
        '.propertyCard-priceValue span'
      ]) || extractPriceFromText($container.text());
      
      // Extract property title/address using RightMove's specific structure
      let title = extractText($container, [
        // RightMove specific selectors for property title
        'h1._2uQQ3SV0eMHL1P6t5ZDo2q', // Exact RightMove class for street address
        'h1[itemprop="streetAddress"]', // Schema.org property
        '.h3U6cGyEUf76tvCpYisik h1', // Parent container + h1
        '[itemprop="address"] h1', // Address container with h1
        'h1._2uQQ3SV0eMHL1P6t5ZDo2q', // RightMove title class
        
        // Fallback selectors
        'h1',
        'h2', 
        '.property-title',
        '.propertyCard-title',
        '.propertyCard-address',
        'a[href*="/properties/"]' // Property links often contain the title
      ]);
      
      // If title is empty or looks like image count, try extracting from link text
      if (!title || title.match(/^\d+\/\d+$/) || title.length < 5) {
        const linkText = $container.find('a[href*="/properties/"]').first().text().trim();
        if (linkText && !linkText.match(/^\d+\/\d+$/) && linkText.length > 5) {
          title = linkText;
        }
        
        // Additional fallback: try to find the address structure anywhere in the container
        const addressContainer = $container.find('.h3U6cGyEUf76tvCpYisik, [itemprop="address"]').first();
        if (addressContainer.length > 0) {
          const addressTitle = addressContainer.find('h1, [itemprop="streetAddress"]').first().text().trim();
          if (addressTitle && addressTitle.length > 5) {
            title = addressTitle;
          }
        }
        
        // Manual search for RightMove address pattern in HTML
        const containerHtml = $container.html() || '';
        if (!title && containerHtml.includes('itemprop="address"')) {
          const addressMatch = containerHtml.match(/<h1[^>]*itemprop="streetAddress"[^>]*>([^<]+)<\/h1>/i);
          if (addressMatch && addressMatch[1]) {
            title = addressMatch[1].trim();
            console.log('Found address via HTML regex:', title);
          }
        }
      }
      
      // Debug: check if we found RightMove specific elements
      const rightMoveAddressElement = $container.find('.h3U6cGyEUf76tvCpYisik, [itemprop="address"]').first();
      if (rightMoveAddressElement.length > 0) {
        console.log('Found RightMove address element:', rightMoveAddressElement.html()?.substring(0, 200));
        const streetAddress = rightMoveAddressElement.find('h1, [itemprop="streetAddress"]').first();
        if (streetAddress.length > 0) {
          console.log('Found street address:', streetAddress.text().trim());
        }
      }
      
      console.log('Final extracted title:', title);
      
      let propertyType = extractText($container, [
        '[data-test="property-type"]',
        '.property-type',
        '.propertyCard-details',
        '.propertyType',
        '.propertyCard-details span'
      ]);
      
      // If property type is image count or pipe symbols, extract from raw text
      if (!propertyType || propertyType.match(/^[\|\s]*\d*\/?\d*[\|\s]*$/) || propertyType.length <= 3) {
        console.log('Property type needs extraction from raw text:', propertyType);
        propertyType = extractPropertyTypeFromText($container.text());
      }
      
      // Extract bedrooms info with enhanced selectors
      let bedrooms = extractText($container, [
        '[data-test="beds"]',
        '.property-bedrooms',
        '.beds',
        '.bedroom',
        '.propertyCard-details',
        // RightMove specific selectors - fixed CSS syntax
        '[class*="bedroom"]',
        '[class*="bed"]',
        'span',
        'div'
      ]);
      
      // If not found through selectors, try text extraction
      if (!bedrooms) {
        bedrooms = extractBedroomsFromText($container.text());
      }
      
      // Extract bathrooms info  
      const bathrooms = extractText($container, [
        '[data-test="baths"]', 
        '.property-bathrooms',
        '.baths',
        '.bathroom',
        '.propertyCard-details'
      ]) || extractBathroomsFromText($container.text());
      
      // Basic extraction logging (reduced for speed)
      if (index < 3) {
        console.log(`=== Property ${index + 1} Extraction ===`);
        console.log('Container HTML preview:', $container.html()?.substring(0, 300));
        console.log('Container classes:', $container.attr('class'));
        console.log('Title extracted:', title);
        console.log('Bedrooms extracted:', bedrooms);
        console.log('Property type extracted:', propertyType?.substring(0, 15) || 'N/A');
      }
      
      // Extract property link
      let link = '';
      if ($property.is('a')) {
        link = $property.attr('href') || '';
      } else {
        const linkElement = $container.find('a[href*="/properties/"]').first();
        link = linkElement.attr('href') || '';
      }
      
      if (link && !link.startsWith('http')) {
        link = `https://www.rightmove.co.uk${link}`;
      }
      
      // Extract images with enhanced logic
      const images: string[] = [];
      const imageUrls = new Set(); // Prevent duplicates
      
      $container.find('img').each((_, img) => {
        const $img = $(img);
        let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
        
        // Skip very small images (likely icons)
        const width = parseInt($img.attr('width') || '0');
        const height = parseInt($img.attr('height') || '0');
        if ((width > 0 && width < 50) || (height > 0 && height < 50)) {
          return;
        }
        
        if (src) {
          // Make relative URLs absolute
          if (src.startsWith('/')) {
            src = `https://www.rightmove.co.uk${src}`;
          } else if (src.startsWith('//')) {
            src = `https:${src}`;
          }
          
          // Accept images from various domains that RightMove uses
          if (src.match(/\.(jpg|jpeg|png|webp)/i) && 
              !src.includes('placeholder') && 
              !src.includes('loading') && 
              !imageUrls.has(src)) {
            imageUrls.add(src);
            images.push(src);
          }
        }
      });
      
      // Images extracted (logging reduced for performance)
      
      // Extract agent info
      const agent = extractText($container, [
        '.property-agent',
        '[data-test="agent-name"]',
        '.agent-name',
        '.agent'
      ]);
      
      // Get property description/summary
      const description = extractText($container, [
        '.property-description',
        '.propertyCard-description', 
        '.summary',
        '.description'
      ]);
      
      // Try to extract data from the full text if individual selectors fail
      const fullText = $container.text();
      console.log('Full text preview:', fullText.substring(0, 200));
      
      // Fallback extraction from full text
      let finalAddress = address;
      
      // If address is just an image count (with or without pipes), extract from raw text
      if (!finalAddress || finalAddress.match(/^[\|\s]*\d+\/\d+[\|\s]*$/)) {
        console.log('Address is image count, extracting from raw text...');
        console.log('Detected image count address:', finalAddress);
        finalAddress = extractAddressFromRawText(fullText) || extractAddressFromText(fullText);
        console.log('New extracted address:', finalAddress);
      }
      
      if (!finalAddress || finalAddress.match(/^[\|\s]*\d+\/\d+[\|\s]*$/) || finalAddress.length < 5) {
        finalAddress = 'Address not found';
      }
      
      const finalPrice = price || extractPriceFromText(fullText) || 'Price not found';
      const finalBedrooms = bedrooms || extractBedroomsFromText(fullText);
      const finalBathrooms = bathrooms || extractBathroomsFromText(fullText);
      const finalTitle = title || extractTitleFromText(fullText) || 'Property title not found';
      
      // Extracted data (logging reduced for performance)
      
      // Only add if we have essential data
      if (link || finalAddress !== 'Address not found') {
        const property = {
          id: `property-${index}-${Date.now()}`,
          address: cleanText(finalAddress),
          title: cleanText(finalTitle),
          price: cleanText(finalPrice), 
          bedrooms: cleanText(finalBedrooms),
          bathrooms: cleanText(finalBathrooms),
          propertyType: cleanText(propertyType),
          link: link || '',
          images,
          description: cleanText(description),
          agent: cleanText(agent)
        };
        
        properties.push(property);
      } else {
        console.log('Skipped property - missing essential data');
      }
    } catch (err) {
      console.warn('Error parsing property:', err);
    }
  });
  
  console.log(`=== Pagination Info ===`);
  console.log(`Total properties extracted: ${properties.length}`);
  
  // Sort properties by price in ascending order (lowest first)
  properties.sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[£,]/g, '')) || 0;
    const priceB = parseFloat(b.price.replace(/[£,]/g, '')) || 0;
    return priceA - priceB;
  });
  
  console.log(`Properties sorted by price (ASC)`);
  
  // Apply pagination and filtering
  const totalFound = properties.length;
  const paginatedProperties = properties.slice(offset, offset + limit);
  
  console.log(`First few properties for debugging:`, paginatedProperties.slice(0, 3).map(p => ({
    price: p.price,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms
  })));
  
  console.log(`Returning ${paginatedProperties.length} properties`);
  
  return {
    properties: paginatedProperties,
    totalFound: totalFound
  };
}


/**
 * Extract property title (street + city) from raw text
 */
function extractTitleFromText(text: string): string {
  console.log('Extracting title from raw text preview:', text.substring(0, 200));
  
  // Look for RightMove-specific patterns and UK address patterns
  const addressPatterns = [
    // RightMove specific: "Anlaby Street, Bradford" pattern
    /([A-Za-z0-9\s]+(?:Street|Road|Avenue|Drive|Lane|Close|Way|Court|Place|Gardens|Crescent|Terrace|Square|Park),?\s*[A-Za-z\s]+)/i,
    
    // Property with number: "123 Main Street, City"
    /(\d+\s+[A-Za-z\s]+(?:Street|Road|Avenue|Drive|Lane|Close|Way|Court|Place|Gardens|Crescent|Terrace),?\s*[A-Za-z\s]+)/i,
    
    // Any address before postcode
    /([A-Za-z0-9\s,]+)(?:\s*[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/i,
    
    // Named properties: "Rose House, Manchester"
    /([A-Za-z0-9\s]+(?:House|Court|Gardens|Place|Manor|Lodge|Hall),?\s*[A-Za-z\s]+)/i,
    
    // Simple "Street, City" pattern
    /([A-Za-z0-9\s]+,\s*[A-Za-z\s]+(?:Bradford|Leeds|Manchester|Birmingham|London|Liverpool|Sheffield|Bristol|Newcastle|Nottingham|Portsmouth|Southampton|Reading|Derby|Plymouth|Wolverhampton|Stoke|Preston|Brighton|Hull|Sunderland|Milton Keynes|Northampton|Norwich|Luton|Solihull|Islington|Croydon|Birkenhead|Blackpool|Oldham|Middlesbrough|Huddersfield|Oxford|Poole|Bolton|Bournemouth|Peterborough|Cambridge|Doncaster|York|Gloucester|Watford|Rotherham|Burnley|Hastings|Stevenage|Warrington|Stockport|Gateshead|Colchester|Carlisle|Chester|Shrewsbury|Wakefield|Blackburn|Grimsby|St Helens|Salford|Basildon|Redditch|Crawley|High Wycombe|Ipswich|Slough|Southend|Telford|Exeter|Cheltenham|Gloucester|Bath|Bradford|Halifax|Harrogate|Skipton|Keighley|Shipley))/i
  ];
  
  for (let i = 0; i < addressPatterns.length; i++) {
    const match = text.match(addressPatterns[i]);
    if (match && match[1]) {
      let title = match[1].trim();
      
      // Clean up the title
      title = title.replace(/^[\d\/\|]+\s*/, ''); // Remove image counts at start
      title = title.replace(/£[\d,]+/g, ''); // Remove prices
      title = title.replace(/\s+/g, ' '); // Normalize spaces
      title = title.replace(/,\s*$/, ''); // Remove trailing comma
      title = title.replace(/^\s*,\s*/, ''); // Remove leading comma
      
      if (title.length >= 10 && !title.match(/^\d+\/\d+/) && title.includes(',')) {
        console.log(`Found title using pattern ${i + 1}:`, title);
        return title;
      }
    }
  }
  
  console.log('No title pattern matched');
  return '';
}

/**
 * Extract bedrooms from property text with enhanced patterns
 */
function extractBedroomsFromText(text: string): string {
  // Multiple patterns to catch bedroom information
  const patterns = [
    // Standard patterns: "2 bed", "2 bedroom", "2 bedrooms"
    /(\d+)\s*(?:bed|bedroom|bedrooms?)(?:\s|$|,)/i,
    
    // RightMove specific patterns
    /BEDROOMS?\s*(\d+)/i,           // "BEDROOMS 2"
    /(\d+)\s*BEDROOMS?/i,           // "2 BEDROOMS"
    
    // In text descriptions: "Two bedroom", "Three bed" etc.
    /(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:bed|bedroom)/i,
    
    // Pattern like "Town House21" where 2 is bedrooms and 1 is bathroom
    /(?:House|Flat|Apartment)(\d)(\d)/i,
    
    // Just numbers followed by bedroom-related text
    /(\d+)\s*br\b/i,                // "2 br"
    /(\d+)\s*bdrm/i,                // "2 bdrm"
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match && match[1]) {
      let result = match[1];
      
      // Convert word numbers to digits
      const wordToNumber: { [key: string]: string } = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
      };
      
      if (wordToNumber[result.toLowerCase()]) {
        result = wordToNumber[result.toLowerCase()];
      }
      
      // Validate result is a reasonable number
      const num = parseInt(result);
      if (num >= 1 && num <= 10) {
        return result;
      }
    }
  }
  
  return '';
}

/**
 * Extract bathrooms from property text  
 */
function extractBathroomsFromText(text: string): string {
  const bathroomMatch = text.match(/(\d+)\s*(?:bath|bathroom)/i);
  return bathroomMatch ? bathroomMatch[1] : '';
}

/**
 * Extract property type from raw text
 */
function extractPropertyTypeFromText(text: string): string {
  console.log('Extracting property type from:', text.substring(0, 150));
  
  // Pattern: ...West YorkshireTown House21Two bedroom...
  // Look for property types that appear after address/price
  const propertyTypePattern = /(Town House|Terraced House|Semi[- ]?Detached House|Detached House|Terraced|Semi[- ]?Detached|Detached|Flat|Apartment|Maisonette|Bungalow|Cottage|Studio|Penthouse|Duplex|End Terrace)/i;
  
  const match = text.match(propertyTypePattern);
  if (match && match[1]) {
    const propertyType = match[1].trim();
    console.log('Found property type:', propertyType);
    // Format properly
    return propertyType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
  
  // Fallback: Look for property types anywhere in the text
  const propertyTypes = [
    'town house', 'townhouse',
    'terraced house', 'terraced', 'terrace', 'end terrace',
    'semi-detached house', 'semi-detached', 'semi detached',
    'detached house', 'detached',
    'flat', 'apartment',
    'maisonette', 
    'bungalow',
    'cottage',
    'studio',
    'penthouse',
    'duplex'
  ];
  
  const lowerText = text.toLowerCase();
  for (const type of propertyTypes) {
    if (lowerText.includes(type)) {
      console.log('Found property type (fallback):', type);
      return type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
  
  return '';
}

/**
 * Extract address from property link text
 */
function extractAddressFromLink($container: any): string {
  const linkElements = $container.find('a[href*="/properties/"]');
  
  console.log(`Found ${linkElements.length} property links in container`);
  
  // Try each property link to find one with meaningful address text
  for (let i = 0; i < linkElements.length; i++) {
    const linkElement = linkElements.eq(i);
    const linkText = linkElement.text().trim();
    const href = linkElement.attr('href');
    
    console.log(`Link ${i + 1}: "${linkText}" | ${href}`);
    
    // Skip if it's just an image count or empty
    if (linkText.match(/^\d+\/\d+$/) || linkText.length < 5) {
      continue;
    }
    
    // Look for address-like content
    if (linkText.match(/\w+\s+\w+/) && // At least two words
        !linkText.match(/^(view|save|contact|more|details|images?)$/i)) { // Not a button
      console.log('Selected address from link:', linkText);
      return linkText;
    }
  }
  
  // If no good link found, try the container's direct text
  const directText = $container.contents().filter(function(this: any) {
    return this.nodeType === 3; // Text nodes only
  }).text().trim();
  
  if (directText && directText.length > 5 && !directText.match(/^\d+\/\d+$/)) {
    console.log('Using direct text from container:', directText);
    return directText;
  }
  
  return '';
}

/**
 * Extract address from RightMove raw text using price as anchor point
 */
function extractAddressFromRawText(text: string): string {
  console.log('Extracting address from raw text:', text.substring(0, 200));
  
  // Pattern variations:
  // ||1/9£120,000Kassapians, Albert Street, Baildon, Shipley, BD17Flat22
  // |1/5£120,000TRINITY COURT, LONG CLOSE LANE, LEEDS, LS9 Flat22
  // |1/13£120,000Offers in Region ofHighfield Terrace, Cleckheaton, BD19End of Terrace21
  // 1/12£120,000Soho Grove, Wakefield, West YorkshireTown House21
  
  // First, try to extract after price, before property type or postcode
  const patterns = [
    // Pattern 1: Price + Address + Property Type
    /£[\d,]+([A-Za-z][A-Za-z0-9\s,\-\.\']+?)(?:Town House|Terraced|Semi[- ]?Detached|Detached|Flat|Apartment|Bungalow|Maisonette|End of Terrace|\d+\s*bed)/i,
    
    // Pattern 2: Price + possible "Offers in Region of" + Address + Property Type  
    /£[\d,]+(?:Offers in Region of)?([A-Za-z][A-Za-z0-9\s,\-\.\']+?)(?:Town House|Terraced|Semi[- ]?Detached|Detached|Flat|Apartment|Bungalow|Maisonette|End of Terrace|\d+\s*bed)/i,
    
    // Pattern 3: Price + Address ending with postcode + anything
    /£[\d,]+([A-Za-z][A-Za-z0-9\s,\-\.\']*(?:LS|WF|BD|HG|YO|[A-Z]{1,2})\d+[A-Z]?)/i,
    
    // Pattern 4: Price + Address + number (bedroom count)
    /£[\d,]+([A-Za-z][A-Za-z0-9\s,\-\.\']+?)\d+\d+/i
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match && match[1]) {
      let address = match[1].trim();
      
      // Clean up common issues
      address = address.replace(/\s+/g, ' '); // Multiple spaces
      address = address.replace(/,$/, ''); // Trailing comma
      
      // Validate it looks like a real address
      if (address.length >= 10 && address.includes(' ') && !address.match(/^\d+\/\d+/)) {
        console.log(`Extracted address using pattern ${i + 1}:`, address);
        return address;
      }
    }
  }
  
  // Fallback: Look for UK postcode patterns and extract surrounding text
  const postcodePattern = /([A-Za-z0-9\s,\-\.\']+(?:LS|WF|BD|HG|YO|[A-Z]{1,2})\d+[A-Z]?)/i;
  const postcodeMatch = text.match(postcodePattern);
  
  if (postcodeMatch) {
    const fullAddress = postcodeMatch[0].trim();
    if (fullAddress.length >= 10 && !fullAddress.match(/^\d+\/\d+/)) {
      console.log('Extracted address using postcode fallback:', fullAddress);
      return fullAddress;
    }
  }
  
  console.log('No address pattern matched');
  return '';
}

/**
 * Extract address from raw text by finding the first meaningful text
 */
function extractAddressFromText(text: string): string {
  // Look for common UK address patterns
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Skip obvious non-address content
    if (line.match(/^(£|bed|bath|images?|photo|view|contact|save)/i)) continue;
    if (line.length < 10) continue; // Too short to be an address
    if (line.match(/^\d+\/\d+$/)) continue; // Skip image counts like "1/5"
    
    // Look for address-like patterns
    if (line.match(/\w+.*\w+/)) { // At least two words
      return line;
    }
  }
  
  return '';
}

/**
 * Extract price from raw text using regex
 */
function extractPriceFromText(text: string): string {
  const priceMatch = text.match(/£[\d,]+/);
  return priceMatch ? priceMatch[0] : '';
}

/**
 * Enhanced text extraction with better debugging
 */
function extractText($element: any, selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const found = $element.find(selector).first();
      if (found.length > 0) {
        const text = found.text().trim();
        if (text && text.length > 0 && !text.match(/^\d+\/\d+$/)) {
          console.log(`Found text "${text}" using selector "${selector}"`);
          return text;
        }
      }
    } catch (error) {
      // Skip invalid selectors (e.g., complex RightMove class names)
      console.log(`Skipping invalid selector: "${selector}"`);
      continue;
    }
  }
  return '';
}

/**
 * Clean and format text content
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
