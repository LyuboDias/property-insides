"use client";
import Link from "next/link";
import { useState } from "react";
import NavigationBar from "@/components/NavigationBar";

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

      console.log('Search response data:', data);

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
    <>
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', color: '#000' }}>
        
        <NavigationBar currentPage="Property Search" pageIcon="🔍" />


      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Search Form */}
        <div style={{ width: '100%', maxWidth: 1200, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', color: '#000', border: '1px solid rgba(255,255,255,0.2)' }}>
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
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#000' }}
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
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#000' }}
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
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#000' }}
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
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#000' }}
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
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#000' }}
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

        {/* Enhanced Property Search System */}
        <div style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: '2px solid rgba(102,126,234,0.3)',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)'
        }}>
          <EnhancedPropertySearch />
        </div>

      </main>
    </div>
    </>
  );
}

// Enhanced Property Search Component
function EnhancedPropertySearch() {
  // Enhanced search state
  const [enhancedFilters, setEnhancedFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    maxBedrooms: "",
    radius: "5",
    propertyTypes: [] as string[],
    excludeRetirement: true,
    excludeBuyingSchemes: true,
    excludeNewHomes: true,
    mustHaveGarden: false,
    mustHaveParking: false
  });

  const [enhancedResults, setEnhancedResults] = useState<any[]>([]);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [enhancedError, setEnhancedError] = useState("");
  const [searchSummary, setSearchSummary] = useState<any>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const propertyTypeOptions = [
    { id: 'detached', label: 'Detached Houses', icon: '🏠' },
    { id: 'semi-detached', label: 'Semi-Detached', icon: '🏘️' },
    { id: 'terraced', label: 'Terraced Houses', icon: '🏠' },
  ];

  const handleEnhancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enhancedFilters.location.trim()) {
      setEnhancedError("Please enter a location");
      return;
    }

    if (enhancedFilters.propertyTypes.length === 0) {
      setEnhancedError("Please select at least one property type");
      return;
    }

    setEnhancedLoading(true);
    setEnhancedError("");
    setEnhancedResults([]);

    try {
      console.log('🔍 Starting Enhanced Multi-Source Search...');
      
      const searchParams = {
        ...enhancedFilters,
        minPrice: enhancedFilters.minPrice ? parseInt(enhancedFilters.minPrice) : undefined,
        maxPrice: enhancedFilters.maxPrice ? parseInt(enhancedFilters.maxPrice) : undefined,
        minBedrooms: enhancedFilters.minBedrooms ? parseInt(enhancedFilters.minBedrooms) : undefined,
        maxBedrooms: enhancedFilters.maxBedrooms ? parseInt(enhancedFilters.maxBedrooms) : undefined,
        radius: parseInt(enhancedFilters.radius)
      };

      console.log('Enhanced search params:', searchParams);

      const response = await fetch('/api/enhanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enhanced search failed');
      }

      console.log('Enhanced search results:', data);
      setEnhancedResults(data.properties);
      setSearchSummary(data.summary);

    } catch (error: any) {
      console.error('Enhanced search error:', error);
      setEnhancedError(error.message || 'Search failed. Please try again.');
    } finally {
      setEnhancedLoading(false);
    }
  };

  const handlePropertyTypeToggle = (typeId: string) => {
    setEnhancedFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(typeId)
        ? prev.propertyTypes.filter(t => t !== typeId)
        : [...prev.propertyTypes, typeId]
    }));
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Enhanced Search Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          🚀 Enhanced Property Search
        </h2>
        <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>
          Multi-source property search with advanced filtering and investment insights
        </p>
      </div>

      {/* Enhanced Search Form */}
      <form onSubmit={handleEnhancedSearch} style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: 32
      }}>
        
        {/* Primary Search Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              📍 Location *
            </label>
            <input
              type="text"
              value={enhancedFilters.location}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Manchester, M1 1AA, or postcode"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              📏 Search Radius
            </label>
            <select
              value={enhancedFilters.radius}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, radius: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
            >
              <option value="1">1 mile</option>
              <option value="3">3 miles</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="15">15 miles</option>
              <option value="20">20 miles</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              💰 Min Price
            </label>
            <input
              type="number"
              value={enhancedFilters.minPrice}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              placeholder="50000"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              💰 Max Price
            </label>
            <input
              type="number"
              value={enhancedFilters.maxPrice}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              placeholder="500000"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
            />
          </div>
        </div>

        {/* Bedroom Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              🛏️ Min Bedrooms
            </label>
            <select
              value={enhancedFilters.minBedrooms}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, minBedrooms: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              🛏️ Max Bedrooms
            </label>
            <select
              value={enhancedFilters.maxBedrooms}
              onChange={(e) => setEnhancedFilters(prev => ({ ...prev, maxBedrooms: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                color: '#000'
              }}
            >
              <option value="">Any</option>
              <option value="2">Up to 2</option>
              <option value="3">Up to 3</option>
              <option value="4">Up to 4</option>
              <option value="5">Up to 5</option>
              <option value="6">Up to 6</option>
            </select>
          </div>
        </div>

        {/* Property Types */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
            🏠 Property Types (Houses Only) *
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {propertyTypeOptions.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handlePropertyTypeToggle(type.id)}
                style={{
                  padding: '12px 20px',
                  border: `2px solid ${enhancedFilters.propertyTypes.includes(type.id) ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: 8,
                  background: enhancedFilters.propertyTypes.includes(type.id) ? '#10b981' : '#fff',
                  color: enhancedFilters.propertyTypes.includes(type.id) ? '#fff' : '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exclusion Filters */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
            🚫 Exclude Properties
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { key: 'excludeRetirement', label: 'Retirement Properties', icon: '👴' },
              { key: 'excludeBuyingSchemes', label: 'Buying Schemes', icon: '🤝' },
              { key: 'excludeNewHomes', label: 'New Builds', icon: '🏗️' }
            ].map((exclusion) => (
              <label key={exclusion.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enhancedFilters[exclusion.key as keyof typeof enhancedFilters] as boolean}
                  onChange={(e) => setEnhancedFilters(prev => ({
                    ...prev,
                    [exclusion.key]: e.target.checked
                  }))}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14, color: '#374151' }}>
                  {exclusion.icon} {exclusion.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {showAdvancedFilters ? '▼' : '▶'} Advanced Filters
          </button>

          {showAdvancedFilters && (
            <div style={{ marginTop: 16, padding: 20, background: 'rgba(102,126,234,0.05)', borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enhancedFilters.mustHaveGarden}
                    onChange={(e) => setEnhancedFilters(prev => ({ ...prev, mustHaveGarden: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>🌳 Must Have Garden</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enhancedFilters.mustHaveParking}
                    onChange={(e) => setEnhancedFilters(prev => ({ ...prev, mustHaveParking: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>🚗 Must Have Parking</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {enhancedError && (
          <div style={{
            padding: 12,
            background: 'rgba(239,68,68,0.1)',
            color: '#dc2626',
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 20,
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            ⚠️ {enhancedError}
          </div>
        )}

        {/* Search Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={enhancedLoading}
            style={{
              background: enhancedLoading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 48px',
              fontSize: 16,
              fontWeight: 600,
              cursor: enhancedLoading ? 'not-allowed' : 'pointer',
              boxShadow: enhancedLoading ? 'none' : '0 4px 15px rgba(16,185,129,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {enhancedLoading ? (
              <>
                <span style={{ marginRight: 8 }}>🔄</span>
                Searching Multiple Sources...
              </>
            ) : (
              <>
                <span style={{ marginRight: 8 }}>🚀</span>
                Search Properties
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search Summary */}
      {searchSummary && (
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          border: '1px solid rgba(16,185,129,0.2)'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px 0', color: '#059669' }}>
            🎯 Search Results Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 14 }}>
            <div>
              <div style={{ color: '#6b7280' }}>Total Properties Found</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{searchSummary.totalProperties}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280' }}>Sources Searched</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>{searchSummary.sourcesSearched?.join(', ')}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280' }}>Properties Excluded</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#ef4444' }}>{searchSummary.propertiesExcluded || 0}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280' }}>Average Price</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>£{searchSummary.averagePrice?.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Demo Data Notice */}
          {enhancedResults.some((p: any) => p.isDemoData) && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: 'rgba(245,158,11,0.1)', 
              borderRadius: 8,
              border: '1px solid rgba(245,158,11,0.3)'
            }}>
              <div style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                🔧 Demo Mode: Some property sources are currently showing sample data while we improve scraping reliability.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Results */}
      {enhancedResults.length > 0 && (
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#374151' }}>
            🏠 Properties Found ({enhancedResults.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
            {enhancedResults.map((property, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#374151' }}>
                    {property.address}
                  </h4>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {property.isDemoData && (
                      <div style={{
                        background: '#f59e0b',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 9,
                        fontWeight: 600
                      }}>
                        DEMO
                      </div>
                    )}
                    <div style={{ 
                      background: property.source === 'rightmove' ? '#ff6b35' : property.source === 'zoopla' ? '#1f4776' : '#10b981',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {property.source}
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                  £{property.price?.toLocaleString()}
                </div>
                
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  <span>🛏️ {property.bedrooms} bed</span>
                  <span>🏠 {property.propertyType}</span>
                  {property.estimatedYield && (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      📈 {property.estimatedYield}% yield
                    </span>
                  )}
                </div>
                
                {property.description && (
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                    {property.description.substring(0, 120)}...
                  </p>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {property.daysOnMarket && `${property.daysOnMarket} days on market`}
                  </div>
                  {property.link && (
                    <a 
                      href={property.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        background: '#667eea',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      View Details
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!enhancedLoading && enhancedResults.length === 0 && searchSummary && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          background: 'rgba(245,158,11,0.1)',
          borderRadius: 12,
          border: '1px solid rgba(245,158,11,0.2)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', color: '#d97706' }}>
            No Properties Found
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Try expanding your search criteria or adjusting your filters
          </p>
        </div>
      )}

      {/* Data Sources Attribution */}
      <div style={{ 
        marginTop: 48, 
        paddingTop: 24, 
        borderTop: '1px solid rgba(0,0,0,0.1)', 
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Enhanced Search Data Sources</div>
          <div style={{ marginBottom: 4 }}>
            <strong>Property Listings:</strong> RightMove, Zoopla, OnTheMarket, PrimeLocation
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>Investment Data:</strong> Rental yield estimates, Property price analysis, Investment scoring algorithms
          </div>
          <div>
            <strong>Filtering:</strong> Advanced exclusion patterns, Property type classification, Location-based analysis
          </div>
          <div style={{ marginTop: 8, fontSize: 9, fontStyle: 'italic' }}>
            Multi-source property search with intelligent deduplication and investment metrics. Property Insides does not guarantee accuracy of third-party data.
          </div>
        </div>
      </div>
    </div>
  );
}
