"use client";
import Link from "next/link";
import { useState } from "react";

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

export default function PropertySearch() {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5");
  const [propertyType, setPropertyType] = useState("");
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalFound, setTotalFound] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const limit = 15;

  /**
   * Handles the property search form submission (initial search)
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(true);
  };

  /**
   * Handles loading more results
   */
  const handleLoadMore = async () => {
    await performSearch(false);
  };

  /**
   * Performs the actual search - either initial or load more
   */
  const performSearch = async (isInitialSearch: boolean) => {
    if (isInitialSearch) {
      setLoading(true);
      setError("");
      setResults([]);
      setCurrentOffset(0);
      setHasSearched(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const offset = isInitialSearch ? 0 : currentOffset + limit;
      
      const searchParams = {
        location,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        bedrooms: bedrooms || undefined,
        radius: radius || undefined,
        propertyType: propertyType || undefined,
        offset,
        limit,
      };

      const response = await fetch('/api/search-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      if (data.success) {
        let properties = data.properties || [];
        
        // Client-side filtering for "Houses" option
        if (propertyType === 'Houses') {
          const houseTypes = ['Terraced', 'Semi Detached House', 'Detached House', 'Town House', 'Semi Detached', 'Detached'];
          properties = properties.filter((property: PropertyResult) => {
            const type = property.propertyType || '';
            return houseTypes.some(houseType => 
              type.toLowerCase().includes(houseType.toLowerCase()) ||
              type.toLowerCase().includes('house') ||
              type.toLowerCase().includes('terraced')
            );
          });
          console.log(`Filtered to ${properties.length} house properties`);
        }
        
        if (isInitialSearch) {
          setResults(properties);
          setCurrentOffset(0);
        } else {
          setResults(prev => [...prev, ...properties]);
          setCurrentOffset(offset);
        }
        
        setTotalFound(properties.length);
        setHasMore(data.hasMore || false);
        
        // Only stop loading for initial search when we have results or confirmation of no results
        if (isInitialSearch) {
          setLoading(false);
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || "Search failed. Please try again.");
      setLoading(false); // Always stop loading on error
    } finally {
      setLoadingMore(false); // Always stop loading more
    }
  };

  /**
   * Handles clicking on a property to show details
   */
  const handlePropertyClick = (property: PropertyResult) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  /**
   * Closes the property details modal
   */
  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  // No pagination needed - showing all loaded results

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', color: '#000' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', color: '#000' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#000' }}>Property Search</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Home</Link>
            <Link href="/calculator" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Calculator</Link>
            <Link href="/checklist" style={{ color: '#0070f3', fontWeight: 500, fontSize: 15, textDecoration: 'underline' }}>Checklist</Link>
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Instructions</h2>
          <ul style={{ color: '#000', fontSize: 14, paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
            <li>Set your search criteria using the form</li>
            <li>Enter location as city name or postcode</li>
            <li>Adjust radius to control search area</li>
            <li>Click Search to find matching properties</li>
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Note</h2>
          <p style={{ color: '#666', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            This is a demo search interface. In a full implementation, this would integrate with property APIs like RightMove or Zoopla.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <div style={{ width: '100%', maxWidth: 800, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32, color: '#000' }}>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
            {/* Price Range */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Minimum Price</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                style={inputStyle}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Maximum Price</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                style={inputStyle}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Bedrooms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Number of Bedrooms</label>
              <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={inputStyle}>
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Location <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. London, Manchester, or SW1A 1AA"
                style={inputStyle}
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Property Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Property Type</label>
              <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={inputStyle}>
                <option value="">Any</option>
                <option value="Houses">Houses</option>
                <option value="Flat">Flat</option>
                <option value="Terraced">Terraced</option>
                <option value="Semi Detached House">Semi Detached House</option>
                <option value="Detached House">Detached House</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Apartment">Apartment</option>
                <option value="Town House">Town House</option>
                <option value="Maisonette">Maisonette</option>
              </select>
            </div>

            {/* Radius */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 13, color: '#000' }}>Search Radius (miles)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={e => setRadius(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ minWidth: 60, fontSize: 14, fontWeight: 500 }}>{radius} miles</span>
              </div>
            </div>

            {/* Search Button */}
            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button 
                type="submit" 
                style={buttonStyle} 
                disabled={loading || !location}
              >
                {loading ? "Searching..." : "Search Properties"}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{error}</div>
          )}

          {/* No Properties Found Message */}
          {hasSearched && !loading && results.length === 0 && !error && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: 24, 
              padding: 20, 
              background: '#f8fafc', 
              borderRadius: 8,
              color: '#666' 
            }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>🏠</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>No properties found</div>
              <div style={{ fontSize: 14 }}>Try adjusting your search criteria or expanding the search radius</div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ width: '100%', maxWidth: 1200, color: '#000' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Found {results.length} properties in {radius} miles of {location.charAt(0).toUpperCase() + location.slice(1)}{maxPrice ? ` for under £${parseInt(maxPrice).toLocaleString()}` : ''}
            </h3>
            
            {/* Properties Table */}
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={tableHeaderStyle}>Property</th>
                    <th style={tableHeaderStyle}>Price</th>
                    <th style={tableHeaderStyle}>Bedrooms</th>
                    <th style={tableHeaderStyle}>Property Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((property) => (
                    <tr 
                      key={property.id}
                      onClick={() => handlePropertyClick(property)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 500, color: '#0070f3' }}>{property.title || 'Property title not found'}</div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{property.price}</div>
                      </td>
                      <td style={tableCellStyle}>
                        {property.bedrooms ? `${property.bedrooms} ${property.bedrooms === '1' ? 'bedroom' : 'bedrooms'}` : 'N/A'}
                      </td>
                      <td style={tableCellStyle}>
                        {property.propertyType || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    ...buttonStyle,
                    padding: '12px 24px',
                    fontSize: 16,
                    opacity: loadingMore ? 0.7 : 1,
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    minWidth: 120
                  }}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Property Details Modal */}
        {showModal && selectedProperty && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: 20
            }}
            onClick={closeModal}
          >
            <div 
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                maxWidth: 800,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: 32,
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
              
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#000' }}>
                Property Details
              </h2>
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000', marginBottom: 8 }}>
                  {selectedProperty.title || 'Property title not found'}
                </h3>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0070f3', marginBottom: 16 }}>
                  {selectedProperty.price}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div>
                  <strong>Bedrooms:</strong> {selectedProperty.bedrooms || 'N/A'}
                </div>
              </div>

              {selectedProperty.description && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Description</h4>
                  <p style={{ color: '#666', lineHeight: 1.6 }}>{selectedProperty.description}</p>
                </div>
              )}

              {selectedProperty.images.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#000' }}>Images ({selectedProperty.images.length})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                    {selectedProperty.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid #e5e7eb'
                        }}
                        onError={(e) => {
                          console.log('Failed to load image:', image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => window.open(selectedProperty.link, '_blank')}
                  style={buttonStyle}
                >
                  View on RightMove
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    ...buttonStyle,
                    background: '#6b7280',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: '#f4f6fa',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 15,
  color: '#222',
  outline: 'none',
  fontWeight: 400,
  marginTop: 2,
  marginBottom: 2,
  transition: 'border 0.2s',
};

const buttonStyle = {
  background: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 28px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  marginTop: 8,
};

const tableHeaderStyle = {
  textAlign: 'left' as const,
  fontWeight: 600,
  padding: '12px 16px',
  color: '#374151',
  fontSize: 14,
};

const tableCellStyle = {
  padding: '12px 16px',
  fontSize: 14,
  color: '#374151',
};
