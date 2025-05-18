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

    // Price (handle 'Offers Over', 'Guide Price', and standard)
    let price =
      $('[data-test="price"]').text().trim() ||
      $('.property-header-price').text().trim() ||
      $('[itemprop="price"]').text().trim() ||
      $(".key-features + div").find('h2:contains("Offers Over")').next().text().trim();
    if (!price) {
      // Try to find price in h2 or strong tags
      price = $("h2:contains('Offers Over')").text().trim() || $("h2:contains('Guide Price')").text().trim();
      if (!price) {
        price = $("strong:contains('Offers Over')").parent().text().trim();
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
        Price: price || 'Not found',
        'Property Type': details['PROPERTY TYPE'] || 'Not found',
        Bedrooms: details['BEDROOMS'] || 'Not found',
        Bathrooms: details['BATHROOMS'] || 'Not found',
        Tenure: details['TENURE'] || 'Not found',
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