import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * Scrapes a RightMove property page for detailed info, supporting multiple layouts
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch RightMove page' }, { status: 500 });
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    // Address
    const address =
      $('[itemprop="streetAddress"]').text().trim() ||
      $('[data-test="address"]').text().trim() ||
      $('h1').first().text().trim() ||
      $("h1").text().trim();

    // Price (handle 'Offers Over', 'Guide Price', and standard formats)
    let price =
      $('[data-test="price"]').text().trim() ||
      $('.property-header-price').text().trim() ||
      $('[itemprop="price"]').text().trim();
      
    if (!price) {
      // Try multiple patterns for price extraction
      const priceSelectors = [
        "h2:contains('Guide Price')",
        "h2:contains('Offers Over')",
        "strong:contains('Guide Price')",
        "strong:contains('Offers Over')",
        "*:contains('Guide Price')",
        "*:contains('Offers Over')"
      ];
      
      for (const selector of priceSelectors) {
        const element = $(selector);
        if (element.length) {
          // Get the element and look for price in the same area
          let priceText = element.parent().text() || element.next().text() || element.text();
          const priceMatch = priceText.match(/£[\d,]+/);
          if (priceMatch) {
            price = priceMatch[0];
            break;
          }
        }
      }
      
      // Fallback: look for any £ price pattern in the entire document
      if (!price) {
        const allText = $('body').text();
        const priceMatch = allText.match(/(?:Guide Price|Offers Over)?\s*£([\d,]+)/i);
        if (priceMatch) {
          price = `£${priceMatch[1]}`;
        }
      }
    }

    // Property Type, Bedrooms, Bathrooms, Tenure, Council Tax, Parking, Garden, Accessibility
    const details: Record<string, string> = {};
    $('dt').each((_, el) => {
      const key = $(el).text().replace(/\s+/g, ' ').trim();
      const value = $(el).next('dd').text().replace(/\s+/g, ' ').trim();
      if (key && value) details[key] = value;
    });

    // Key Features
    let keyFeatures: string[] = [];
    $('h2:contains("Key features")').next('ul').find('li').each((_, el) => {
      keyFeatures.push($(el).text().trim());
    });
    if (keyFeatures.length === 0) {
      // Try alternative selector
      $('.key-features li').each((_, el) => {
        keyFeatures.push($(el).text().trim());
      });
    }

    // Description: concatenate summary and description blocks
    let description = '';
    const summary = $('h2:contains("SUMMARY")').next('p').text().trim();
    if (summary) description += summary + '\n';
    const descBlock = $('h2:contains("DESCRIPTION")').nextUntil('h2');
    if (descBlock.length) {
      descBlock.each((_, el) => {
        description += $(el).text().trim() + '\n';
      });
    } else {
      // Fallback to other selectors
      description = description ||
        $('[data-test="description"]').text().trim() ||
        $('[itemprop="description"]').text().trim() ||
        $('.property-description').text().trim();
    }

    // Agent & Agent Address
    let agent = '', agentAddress = '';
    const marketedBy = $("*:contains('MARKETED BY')").last();
    if (marketedBy.length) {
      agent = marketedBy.next().text().trim() || marketedBy.parent().find('a').first().text().trim();
      agentAddress = marketedBy.parent().find('address').text().trim() || marketedBy.parent().find('p').first().text().trim();
    }
    if (!agent) {
      // Try sidebar/footer
      agent = $(".sidebar-contact-title").text().trim() || $(".agent-details__name").text().trim();
    }
    if (!agentAddress) {
      agentAddress = $(".sidebar-contact-address").text().trim() || $(".agent-details__address").text().trim();
    }

    // Images: filter for property images
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && /rightmove.*\/images\//.test(src)) images.push(src);
    });

    // Date Added
    let dateAdded = '';
    const addedOnText = $("*:contains('Added on')").text().trim();
    if (addedOnText) {
      const match = addedOnText.match(/Added on (\d{2}\/\d{2}\/\d{4})/);
      if (match) {
        dateAdded = match[1];
      }
    }

    // Extract postcode from address or location info
    let postcode = '';
    const addressText = address;
    const postcodeMatch = addressText.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/);
    if (postcodeMatch) {
      postcode = postcodeMatch[1];
    }

    // Auction Details
    let auctionDetails = '';
    $('h2:contains("MODERN METHOD OF AUCTION")').nextUntil('h2').each((_, el) => {
      auctionDetails += $(el).text().trim() + '\n';
    });
    if (!auctionDetails) {
      auctionDetails = $("*:contains('Modern Method of Auction')").text();
    }

    // Compose response
    return NextResponse.json({
      property: {
        Address: address || 'Not found',
        'Post Code': postcode || 'Not found',
        Price: price || 'Not found',
        'Property Type': details['PROPERTY TYPE'] || 'Not found',
        Bedrooms: details['BEDROOMS'] || 'Not found',
        Bathrooms: details['BATHROOMS'] || 'Not found',
        'Date Added': dateAdded || 'Not found',
        Tenure: details['TENURE'] || details['Tenure'] || 'Not found',
        'Key Features': keyFeatures.length ? keyFeatures : 'Not found',
        Description: description || 'Not found',
        Agent: agent || 'Not found',
        'Agent Address': agentAddress || 'Not found',
        'Council Tax': details['COUNCIL TAX'] || 'Not found',
        Parking: details['PARKING'] || 'Not found',
        Garden: details['GARDEN'] || 'Not found',
        Accessibility: details['ACCESSIBILITY'] || 'Not found',
        Images: images.length ? images : 'Not found',
        'Auction Details': auctionDetails || 'Not found',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 