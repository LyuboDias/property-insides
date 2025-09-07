import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface PropertySearchParams {
  location: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  radius?: string;
  propertyType?: string;
}

interface PropertyResult {
  id: string;
  address: string;
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
    console.log('HTML title check:', html.includes('<title>') ? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] : 'No title found');
    
    const properties = extractPropertiesFromHtml(html);
    console.log('=== Extraction Complete ===');
    console.log('Total properties found:', properties.length);

    return NextResponse.json({
      success: true,
      properties,
      totalFound: properties.length,
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
    // Map our property types to RightMove property type codes
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
    }
  }
  
  // Include sold STC properties
  searchParams.set('_includeSSTC', 'on');
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Extracts property listings from RightMove search results HTML
 */
function extractPropertiesFromHtml(html: string): PropertyResult[] {
  const $ = cheerio.load(html);
  const properties: PropertyResult[] = [];
  
  // Debug: log some key elements we can find
  console.log('=== HTML Structure Analysis ===');
  console.log('Title:', $('title').text());
  console.log('Found divs:', $('div').length);
  console.log('Found links:', $('a').length);
  console.log('Property links found:', $('a[href*="/properties/"]').length);
  
  // Check for common RightMove class patterns
  console.log('=== Class Pattern Analysis ===');
  const commonClasses = ['propertyCard', 'l-searchResult', 'searchResult', 'property-result'];
  commonClasses.forEach(className => {
    const count = $(`.${className}`).length;
    console.log(`Class "${className}": ${count} elements`);
  });
  
  // Sample the first few property links to understand structure
  console.log('=== Sample Property Links ===');
  $('a[href*="/properties/"]').slice(0, 3).each((i, el) => {
    const $link = $(el);
    console.log(`Link ${i + 1}:`, $link.text().trim(), '|', $link.attr('href'));
    console.log(`  - Parent element:`, $link.parent().prop('tagName'), $link.parent().attr('class'));
    console.log(`  - Parent text:`, $link.parent().text().trim().substring(0, 100));
  });
  
  // Look for h2 elements that might contain addresses
  console.log('=== H2 Elements (potential addresses) ===');
  $('h2').slice(0, 5).each((i, el) => {
    console.log(`H2 ${i + 1}:`, $(el).text().trim());
  });
  
  // Look for spans that might contain addresses
  console.log('=== Address-like text patterns ===');
  const addressPattern = /[A-Za-z]+\s+[A-Za-z,\s]+\s+(LS\d+|[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/;
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (addressPattern.test(text) && text.length < 100) {
      console.log('Found address pattern:', text);
    }
  });
  
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
    console.log(`Trying selector "${selector}": found ${propertyElements.length} elements`);
    if (propertyElements.length > 0) break;
  }
  
  // If no specific property cards found, try finding any links with property URLs
  if (propertyElements.length === 0) {
    console.log('No property cards found, trying property links...');
    propertyElements = $('a[href*="/properties/"]');
    console.log(`Found ${propertyElements.length} property links`);
    
    // Additional debugging - look for common RightMove class patterns
    console.log('Looking for other possible containers...');
    console.log('Elements with "property" in class:', $('[class*="property"]').length);
    console.log('Elements with "card" in class:', $('[class*="card"]').length);
    console.log('Elements with "result" in class:', $('[class*="result"]').length);
    
    // Try to find any structured property containers
    const possibleContainers = $('div').filter((i, el) => {
      const className = $(el).attr('class') || '';
      return className.includes('property') || className.includes('card') || className.includes('result');
    });
    
    console.log(`Found ${possibleContainers.length} possible property containers`);
    if (possibleContainers.length > 0) {
      propertyElements = possibleContainers;
    }
  }
  
  propertyElements.each((index, element) => {
    try {
      const $property = $(element);
      
      console.log(`\n=== Processing property ${index + 1} ===`);
      console.log('Element tag:', $property.prop('tagName'));
      console.log('Element classes:', $property.attr('class'));
      console.log('Element HTML preview:', $property.html()?.substring(0, 300));
      
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
      
      // Extract bedrooms info
      const bedrooms = extractText($container, [
        '[data-test="beds"]',
        '.property-bedrooms',
        '.beds',
        '.bedroom',
        '.propertyCard-details'
      ]) || extractBedroomsFromText($container.text());
      
      // Extract bathrooms info  
      const bathrooms = extractText($container, [
        '[data-test="baths"]', 
        '.property-bathrooms',
        '.baths',
        '.bathroom',
        '.propertyCard-details'
      ]) || extractBathroomsFromText($container.text());
      
      console.log('Property details extraction:', {
        propertyType,
        bedrooms, 
        bathrooms,
        rawText: $container.text().substring(0, 100)
      });
      
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
      
      // Extract images
      const images: string[] = [];
      $container.find('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && (src.includes('rightmove') || src.includes('rightmove.co.uk'))) {
          images.push(src);
        }
      });
      
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
      
      console.log('Extracted data:', { 
        address: finalAddress, 
        price: finalPrice, 
        link, 
        bedrooms: finalBedrooms, 
        propertyType 
      });
      
      // Only add if we have essential data
      if (link || finalAddress !== 'Address not found') {
        const property = {
          id: `property-${index}-${Date.now()}`,
          address: cleanText(finalAddress),
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
        console.log('Added property:', property.address);
      } else {
        console.log('Skipped property - missing essential data');
      }
    } catch (err) {
      console.warn('Error parsing property:', err);
    }
  });
  
  return properties;
}


/**
 * Extract bedrooms from property text
 */
function extractBedroomsFromText(text: string): string {
  const bedroomMatch = text.match(/(\d+)\s*(?:bed|bedroom)/i);
  return bedroomMatch ? bedroomMatch[1] : '';
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
    const found = $element.find(selector).first();
    if (found.length > 0) {
      const text = found.text().trim();
      if (text) {
        console.log(`Found text "${text}" using selector "${selector}"`);
        return text;
      }
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
