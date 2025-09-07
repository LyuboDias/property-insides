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
  const [error, setError] = useState("");
  const [totalFound, setTotalFound] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  /**
   * Handles the property search form submission
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");
    setResults([]);
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page
    
    try {
      console.log('=== SEARCHING ALL PAGES ===');
      
      const searchParams = {
        location,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        bedrooms: bedrooms || undefined,
        radius: radius || undefined,
        propertyType: propertyType || undefined,
      };

      console.log('Search params:', searchParams);

      const response = await fetch('/api/search-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      let { properties } = data;

      console.log(`API returned ${properties.length} properties from ${data.pagesScraped} pages`);

      // Apply client-side filtering for "Houses" if needed (since RightMove doesn't support it)
      if (propertyType === 'Houses') {
        const originalCount = properties.length;
        console.log(`Original properties before house filtering: ${originalCount}`);
        
        const houseKeywords = ['terraced', 'semi-detached', 'detached', 'townhouse', 'town house', 'end terrace'];
        properties = properties.filter((property: PropertyResult) => {
          if (!property.propertyType) return false;
          const propertyTypeLower = property.propertyType.toLowerCase();
          return houseKeywords.some(keyword => propertyTypeLower.includes(keyword));
        });
        
        console.log(`Filtered to ${properties.length} house properties (removed ${originalCount - properties.length} non-house properties)`);
      }
      
      setResults(properties);
      setTotalFound(properties.length);
      
      console.log(`=== SEARCH COMPLETE ===`);
      console.log(`Total properties loaded: ${properties.length}`);
      console.log(`Pages scraped: ${data.pagesScraped}`);
      console.log(`RightMove reported total: ${data.rightMoveTotalCount}`);
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
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

  // Calculate pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', color: '#000' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', color: '#000' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Property Search</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Find your perfect property investment</p>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🏠 Home
            </Link>
            <Link href="/calculator" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🧮 Calculator
            </Link>
            <Link href="/checklist" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              ✅ Checklist
            </Link>
            <Link href="/property-search" style={{ color: '#0070f3', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, background: '#f0f8ff', fontWeight: 500 }}>
              🔍 Property Search
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Search Form */}
        <div style={{ width: '100%', maxWidth: 1200, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', color: '#000' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>Search Properties</h2>
          
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, alignItems: 'end' }}>
            {/* Location */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Leeds, LS1 1AA"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                required
              />
            </div>

            {/* Min Price */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Min Price
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="e.g. 100000"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            {/* Max Price */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Max Price
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="e.g. 200000"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Min Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              >
                <option value="">Any</option>
                <option value="Houses">Houses</option>
                <option value="Flat">Flat</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Park home">Park home</option>
              </select>
            </div>

            {/* Radius */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                Radius: {radius} miles
              </label>
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
                style={{
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
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
              <div style={{ fontSize: 14 }}>Try adjusting your search criteria</div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ width: '100%', maxWidth: 1200, color: '#000' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Found {results.length} properties in {radius} miles of {location.charAt(0).toUpperCase() + location.slice(1)}
              {maxPrice ? ` for under £${parseInt(maxPrice).toLocaleString()}` : ''}
            </h3>
            
            {/* Properties Table */}
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Property</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Price</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Bedrooms</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#374151' }}>Property Type</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResults.map((property) => (
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
                      <td style={{ padding: '16px 20px', fontSize: 14 }}>
                        <div style={{ fontWeight: 500, color: '#0070f3' }}>{property.title || 'Property title not found'}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{property.price}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14 }}>
                        {property.bedrooms ? `${property.bedrooms} ${property.bedrooms === '1' ? 'bedroom' : 'bedrooms'}` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14 }}>
                        {property.propertyType || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: 24,
                padding: '16px 24px',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
              }}>
                {/* Page Info */}
                <div style={{ fontSize: 14, color: '#666' }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} properties
                </div>
                
                {/* Page Controls */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 6,
                            background: isActive ? '#0070f3' : '#fff',
                            color: isActive ? '#fff' : '#666',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: isActive ? 600 : 400,
                            minWidth: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <span style={{ padding: '8px 4px', color: '#999' }}>...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 6,
                            background: totalPages === currentPage ? '#0070f3' : '#fff',
                            color: totalPages === currentPage ? '#fff' : '#666',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: totalPages === currentPage ? 600 : 400,
                            minWidth: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
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
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20
            }}
            onClick={closeModal}
          >
            <div 
              style={{
                background: '#fff',
                borderRadius: 12,
                maxWidth: 800,
                maxHeight: '90vh',
                width: '100%',
                overflow: 'auto',
                position: 'relative',
                color: '#000'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
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
                  zIndex: 1001,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4
                }}
              >
                ×
              </button>

              {/* Property Images */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  {selectedProperty.images.slice(0, 1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 300,
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.jpg';
                      }}
                    />
                  ))}
                </div>
              )}

              <div style={{ padding: '0 24px 24px 24px' }}>
                {/* Property Title */}
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, paddingRight: 40 }}>
                  {selectedProperty.title || 'Property title not found'}
                </h3>

                {/* Price */}
                <div style={{ fontSize: 24, fontWeight: 700, color: '#0070f3', marginBottom: 20 }}>
                  {selectedProperty.price}
                </div>

                {/* Property Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Bedrooms</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedProperty.bedrooms || 'N/A'}</div>
                  </div>
                  
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Link</div>
                    <a 
                      href={selectedProperty.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}
                    >
                      View on RightMove →
                    </a>
                  </div>
                </div>

                {/* Description */}
                {selectedProperty.description && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Description</h4>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#666' }}>
                      {selectedProperty.description}
                    </p>
                  </div>
                )}

                {/* All Images Grid */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>All Photos ({selectedProperty.images.length})</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                      gap: 8 
                    }}>
                      {selectedProperty.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Property image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-property.jpg';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
