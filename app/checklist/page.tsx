"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const checklistTemplate = [
  // Section, Label, Type, Options, Note, Key
  ["Details", "Property Address", "text", undefined, undefined, "propertyAddress"],
  ["Details", "Viewing Date / Time", "text", undefined, undefined, "viewingDateTime"],
  ["Details", "Agent / Vendor", "text", undefined, undefined, "agentVendor"],
  ["General", "Area check/walk", "select", ["", "Y", "N"], undefined, "areaCheck"],
  ["General", "Street / location check", "text", undefined, "e.g. type of cars parked, neighbours, crime stats, shops, schools, transport and access, flood risk, any foul smells, signs of knotweed / mining", "streetCheck"],
  ["General", "EPC available / grade", "text", undefined, undefined, "epc"],
  ["General", "Number of bedrooms / bathrooms / reception rooms", "text", undefined, "____ bed(s) ____ bathroom(s) ____ reception(s)", "roomCounts"],
  ["General", "Freehold / Leasehold (term remaining)", "text", undefined, "FH / LH  ____ years", "tenure"],
  ["Exterior", "Brickwork - pointing", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "brickPointing"],
  ["Exterior", "Brickwork - rendering quality (if applicable)", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "brickRendering"],
  ["Exterior", "Brickwork - age/condition", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "brickAge"],
  ["Exterior", "Brickwork - vents", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "brickVents"],
  ["Exterior", "Roof - flat roof/tiles quality", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "roofQuality"],
  ["Exterior", "Roof - chimneys straight", "select", ["", "Y", "N"], undefined, "roofChimneys"],
  ["Exterior", "Roof - flashing secure", "select", ["", "Y", "N"], undefined, "roofFlashing"],
  ["Exterior", "Roof - guttering/drains", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "roofGuttering"],
  ["Exterior", "Roof - fascias condition", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "roofFascias"],
  ["Exterior", "Front - driveway / access condition", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "driveway"],
  ["Security", "Locks - Doors / Windows", "select", ["", "Y", "N"], undefined, "locks"],
  ["Security", "Alarm", "select", ["", "Y", "N"], undefined, "alarm"],
  ["Security", "Smoke / CO2 Alarms", "select", ["", "Y", "N"], undefined, "smokeAlarms"],
  ["Internal (each room)", "Damp issues (walls / floors)", "select", ["", "Y", "N"], undefined, "damp"],
  ["Internal (each room)", "Condensation concerns (windows)", "select", ["", "Y", "N"], undefined, "condensation"],
  ["Internal (each room)", "Radiators - working / available", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "radiators"],
  ["Internal (each room)", "Wiring / sockets / switches quality and quantity", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "wiring"],
  ["Internal (each room)", "Telephone / TV aerial points", "select", ["", "Y", "N"], undefined, "tvPoints"],
  ["Internal (each room)", "Wall / ceiling cracks", "select", ["", "Y", "N"], undefined, "cracks"],
  ["Internal (each room)", "Decoration / modernisation required?", "select", ["", "Y", "N"], undefined, "decoration"],
  ["Internal (each room)", "New flooring required?", "select", ["", "Y", "N"], undefined, "flooring"],
  ["Internal (each room)", "Sufficient storage space", "select", ["", "Y", "N"], undefined, "storage"],
  ["Internal (each room)", "Neighbours / outside noise", "select", ["", "Y", "N"], undefined, "noise"],
  ["Internal (each room)", "Mobile signal quality - test", "select", ["", "Poor", "Avg", "Good"], undefined, "mobileSignal"],
  ["Bath", "Electric shower?", "select", ["", "Y", "N"], undefined, "electricShower"],
  ["Bath", "Tile / grout condition", "select", ["", "Poor", "Avg", "Good", "New"], undefined, "tileGrout"],
  ["Bath", "Ventilation - signs of mould?", "select", ["", "Y", "N"], undefined, "bathVentilation"],
  ["Garden", "Easy to maintain?", "select", ["", "Y", "N"], undefined, "gardenEasy"],
  ["Garden", "Overlooked by neighbours?", "select", ["", "Y", "N"], undefined, "gardenOverlooked"],
  ["Garden", "Aspect / Direction", "select", ["", "N", "E", "S", "W"], undefined, "gardenAspect"],
  ["Test / Check", "Taps / water pressure", "select", ["", "Poor", "Avg", "Good"], undefined, "taps"],
  ["Test / Check", "Boiler - last service?", "text", undefined, undefined, "boilerService"],
  ["Test / Check", "Lights / switches / powerpoints", "select", ["", "Y", "N"], undefined, "lights"],
  ["Test / Check", "Windows / doors open and close easily", "select", ["", "Y", "N"], undefined, "windows"],
  ["Test / Check", "Loft access?", "select", ["", "Y", "N"], undefined, "loft"],
  ["Test / Check", "Chimneys work/cleaned?", "select", ["", "Y", "N"], undefined, "chimneys"],
  ["Test / Check", "Electricals / consumer unit last checked?", "select", ["", "Y", "N"], undefined, "electricals"],
  ["Test / Check", "Meters / Valves (check access to Gas / Electrical / Stopcock)", "select", ["", "Y", "N"], undefined, "meters"],
  ["Other", "Additional Notes / Comments", "textarea", undefined, undefined, "notes"],
  ["Other", "Reasons / motivations for selling?", "textarea", undefined, "- Time on market / chain-free? - Previous offers? - Has it been reduced?", "reasons"],
  ["Other", "Currently tenanted?", "textarea", undefined, "- If so, rental history / term of tenants / current rent - Rent comparative to nearby area?", "tenanted"],
  ["Other", "Major works completed recently / due to be done?", "textarea", undefined, "- New paint / flooring? - New windows/doors? Damp proof course? Boiler age? - Any developments occurring nearby? - Is it in a Conservation Area / Heritage Listed property?", "majorWorks"],
  ["Other", "What's included with the property on sale?", "textarea", undefined, "- Fixtures/fittings/appliances? Access issues?", "included"],
  ["Other", "Current asking price negotiable?", "textarea", undefined, "- Is there a baseline for the vendor? - Previous sale price / date last sold?", "negotiable"],
];

const sectionOrder = [
  "Details", "General", "Exterior", "Security", "Internal (each room)", "Bath", "Garden", "Test / Check", "Other"
];

export default function Checklist() {
  const [fields, setFields] = useState(() => Object.fromEntries(checklistTemplate.map(([, , , , , key]) => [key, ""])));

  const handleChange = (key: string, value: string) => {
    setFields((f: Record<string, string>) => ({ ...f, [key]: value }));
  };

  const handleDownload = () => {
    let csv = 'Section,Label,Value\n';
    for (const [section, label, , , , key] of checklistTemplate) {
      csv += `"${section}","${label}","${fields[key as string] || ""}"
`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-viewing-checklist.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile/Desktop responsive styles */}
      <style jsx>{`
        /* Ultra-aggressive mobile override - highest specificity possible */
        @media screen and (max-width: 768px) {
          .sidebar {
            display: none !important;
          }
          
          /* Nuclear option: Override everything with maximum specificity */
          html body div div div.checklist-item[style*="display"][style*="flex"] {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          
          html body div div div.field-label[style*="min-width"][style*="240px"] {
            width: 100% !important;
            min-width: 0 !important;
            display: block !important;
            margin-bottom: 8px !important;
            font-size: 15px !important;
            order: 1 !important;
          }
          
          html body div div div.input-container[style*="flex"] {
            width: 100% !important;
            flex: none !important;
            display: flex !important;
            flex-direction: column !important;
            order: 2 !important;
          }
          .main-content {
            padding: 16px 12px !important;
            padding-top: 80px !important;
            width: 100% !important;
            min-width: 0 !important;
            overflow-x: hidden !important;
          }
          .content-card {
            padding: 20px 16px !important;
            margin: 0 !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Mobile: Stack elements vertically - Override all inline styles */
          .checklist-item[style] {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 16px !important;
            margin-bottom: 8px !important;
            border-radius: 16px !important;
            background: rgba(255,255,255,0.95) !important;
            border: 1px solid rgba(102,126,234,0.15) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
            min-width: 0 !important;
          }
          
          /* Label: Full width at top - Override inline styles */
          .field-label[style] {
            width: 100% !important;
            min-width: auto !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            color: #1a202c !important;
            margin-bottom: 8px !important;
            line-height: 1.4 !important;
            display: block !important;
            order: 1 !important;
            padding-top: 0 !important;
            flex: none !important;
            align-items: stretch !important;
          }
          
          /* Input Container: Full width below label - Override inline styles */
          .input-container[style] {
            width: 100% !important;
            flex: none !important;
            order: 2 !important;
            margin-top: 0 !important;
            gap: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            min-width: 0 !important;
          }
          
          /* Input Field: Full width */
          .input-field {
            width: 100% !important;
            order: 1 !important;
          }
          
          /* Input elements: Full width, proper spacing - Override inline styles */
          .field-input[style], .field-select[style], .field-textarea[style] {
            width: 100% !important;
            min-width: 100% !important;
            font-size: 16px !important;
            padding: 14px 16px !important;
            border-radius: 12px !important;
            border: 2px solid rgba(0,0,0,0.15) !important;
            background: #fff !important;
            box-sizing: border-box !important;
            -webkit-appearance: none !important;
            color: #1a202c !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
            margin-bottom: 0 !important;
            transition: all 0.2s ease !important;
          }
          
          /* Also target without [style] for elements that might not have inline styles */
          .field-input, .field-select, .field-textarea {
            width: 100% !important;
            min-width: 100% !important;
            font-size: 16px !important;
            padding: 14px 16px !important;
            border-radius: 12px !important;
            border: 2px solid rgba(0,0,0,0.15) !important;
            background: #fff !important;
            box-sizing: border-box !important;
            -webkit-appearance: none !important;
            color: #1a202c !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
            margin-bottom: 0 !important;
            transition: all 0.2s ease !important;
          }
          
          /* Input field container styling */
          .input-field * {
            width: 100% !important;
          }
          .field-textarea {
            min-height: 80px !important;
            resize: vertical !important;
            font-family: inherit !important;
            line-height: 1.5 !important;
          }
          /* Field Note: Below input field */
          .field-note {
            width: 100% !important;
            font-size: 13px !important;
            color: #666 !important;
            line-height: 1.4 !important;
            padding: 10px 14px !important;
            background: rgba(102,126,234,0.08) !important;
            border-radius: 10px !important;
            border: 1px solid rgba(102,126,234,0.15) !important;
            margin-top: 8px !important;
            order: 2 !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            box-sizing: border-box !important;
          }
          .mobile-header {
            display: block !important;
          }
          .section-container {
            margin-bottom: 16px !important;
            padding: 16px 14px !important;
            border-radius: 16px !important;
            background: rgba(255,255,255,0.95) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
            border: 1px solid rgba(102,126,234,0.1) !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .section-title {
            font-size: 17px !important;
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
            border-bottom: 2px solid rgba(102,126,234,0.15) !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .page-title {
            font-size: 20px !important;
            margin-bottom: 6px !important;
            text-align: center !important;
          }
          .page-description {
            font-size: 13px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          .download-section {
            margin-top: 20px !important;
            padding: 16px 12px !important;
          }
          .download-button {
            width: 100% !important;
            padding: 14px 20px !important;
            font-size: 14px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }
          .main-content {
            padding-top: 40px !important;
          }
        }
        .field-input:focus, .field-select:focus, .field-textarea:focus {
          outline: none !important;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1) !important;
        }
        
        /* Prevent zoom on iOS when focusing inputs */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          .field-input, .field-select, .field-textarea {
            font-size: max(16px, 1em) !important;
          }
        }
        
        /* Improve touch targets */
        @media (max-width: 768px) {
          .field-input, .field-select, .field-textarea {
            min-height: 44px !important;
            touch-action: manipulation !important;
          }
          
          .download-button {
            min-height: 48px !important;
            touch-action: manipulation !important;
          }
          
          .mobile-header a, .mobile-header span {
            min-height: 32px !important;
            min-width: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            touch-action: manipulation !important;
          }
          
          /* Better text wrapping for labels */
          .field-label {
            word-wrap: break-word !important;
            word-break: break-word !important;
            hyphens: auto !important;
          }
          
          /* Improve scrolling on mobile */
          body {
            -webkit-overflow-scrolling: touch !important;
          }
          
          /* Ensure no horizontal scroll */
          .main-content, .content-card, .section-container {
            overflow-x: hidden !important;
          }
          
          /* Better focus styles for mobile */
          .field-input:focus, .field-select:focus, .field-textarea:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.2) !important;
            outline: none !important;
            background: #fff !important;
          }
          
          /* Enhanced dropdown styling */
          .field-select:hover {
            border-color: rgba(102,126,234,0.5) !important;
            box-shadow: 0 4px 16px rgba(102,126,234,0.2) !important;
            transform: translateY(-1px) !important;
          }
          
          .field-select:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.15), 0 4px 20px rgba(102,126,234,0.15) !important;
            transform: translateY(-1px) !important;
          }
          
          /* Empty vs Filled select states */
          .field-select-empty {
            color: #9CA3AF !important;
            font-style: italic !important;
          }
          
          .field-select-filled {
            color: #1a202c !important;
            font-weight: 600 !important;
          }
          
          .field-select-empty:focus {
            color: #1a202c !important;
            font-style: normal !important;
          }
          
          /* Remove default select styling */
          .field-select {
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
          
          .field-select::-ms-expand {
            display: none !important;
          }
          
          /* Ensure proper mobile structure - Force stacking */
          .checklist-item > * {
            width: 100% !important;
            box-sizing: border-box !important;
            flex: none !important;
          }
          
          /* Remove desktop-specific styles on mobile */
          .field-label {
            min-width: auto !important;
            align-items: stretch !important;
            padding-top: 0 !important;
          }
          
          /* Maximum specificity override for all elements */
          div.checklist-item > div.field-label {
            display: block !important;
            width: 100% !important;
            min-width: auto !important;
            order: 1 !important;
          }
          
          div.checklist-item > div.input-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            flex: none !important;
            order: 2 !important;
          }
        }
        
        /* Force vertical stacking for very small screens or when needed */
        @media (max-width: 900px) {
          .checklist-item[style] {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .field-label[style] {
            width: 100% !important;
            min-width: auto !important;
            display: block !important;
            margin-bottom: 8px !important;
          }
          
          .input-container[style] {
            width: 100% !important;
            flex: none !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
      
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
        display: 'flex', 
        color: '#000',
        overflowX: 'hidden' 
      }}>
        {/* Mobile Header */}
        <div className="mobile-header" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          background: 'rgba(255,255,255,0.98)', 
          backdropFilter: 'blur(15px)',
          padding: '12px 16px', 
          borderBottom: '1px solid rgba(102,126,234,0.2)',
          zIndex: 1000,
          display: 'none',
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              margin: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📋 Checklist
            </h1>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              background: 'rgba(102,126,234,0.1)',
              borderRadius: 20,
              padding: '6px 8px'
            }}>
              <Link href="/" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                🏠
              </Link>
              <Link href="/calculator" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                🧮
              </Link>
              <span style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                ✅
              </span>
              <Link href="/property-search" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 11,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                🔍
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop only */}
        <aside className="sidebar" style={{ 
          width: 320, 
          background: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(0,0,0,0.1)', 
          minHeight: '100vh', 
          padding: '40px 32px 32px 32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 32, 
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)', 
          color: '#000' 
        }}>
        <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Viewing Checklist
            </h1>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Essential checks for property viewings</p>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 14, 
                padding: '12px 16px', 
                borderRadius: 12, 
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🏠 Home
              </Link>
              <Link href="/calculator" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 14, 
                padding: '12px 16px', 
                borderRadius: 12, 
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🧮 Calculator
              </Link>
              <Link href="/checklist" style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontSize: 14, 
                padding: '12px 16px', 
                borderRadius: 12, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                ✅ Checklist
              </Link>
              <Link href="/property-search" style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: 14, 
                padding: '12px 16px', 
                borderRadius: 12, 
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🔍 Property Search
              </Link>
            </nav>
        </div>
      </aside>

      {/* Main content */}
        <div className="main-content" style={{ 
          flex: 1, 
          padding: '40px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          color: '#000',
          minWidth: 0,
          width: '100%'
        }}>
          <div className="content-card" style={{ 
            width: '100%', 
            maxWidth: 1000, 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 20, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)', 
            padding: 32, 
            border: '1px solid rgba(255,255,255,0.2)',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 className="page-title" style={{ 
                fontSize: 28, 
                fontWeight: 700, 
                marginBottom: 8, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}>
                📋 Property Viewing Checklist
              </h2>
              <p className="page-description" style={{ color: '#666', fontSize: 14, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
                Comprehensive checklist to ensure you don't miss any important details during your property viewing.
              </p>
            </div>
            
          {sectionOrder.map(section => (
            <Section key={section} title={section}>
              {checklistTemplate.filter(([s]) => s === section).map(([section, label, type, options, note, key]) => (
                <ChecklistItem
                  key={key as string}
                  label={label as string}
                  type={type as string}
                  options={options as string[] | undefined}
                  note={note as string | undefined}
                  value={fields[key as string]}
                  onChange={v => handleChange(key as string, v)}
                />
              ))}
            </Section>
          ))}
            
            <div className="download-section" style={{ 
              textAlign: 'center', 
              marginTop: 32,
              padding: '24px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <button 
                type="button" 
                className="download-button"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '16px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(102,126,234,0.3)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center',
                  minWidth: 'auto'
                }}
                onClick={handleDownload}
                onMouseEnter={e => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 12px 35px rgba(102,126,234,0.4)';
                }}
                onMouseLeave={e => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.3)';
                }}
              >
                📥 Download Checklist
              </button>
              <p style={{ color: '#666', fontSize: 14, marginTop: 12, margin: 0 }}>
                Export your checklist as a CSV file for record keeping
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const getSectionIcon = (title: string) => {
    const icons: { [key: string]: string } = {
      'Details': '📝',
      'General': '🏠',
      'Exterior': '🏗️',
      'Security': '🔒',
      'Internal (each room)': '🏠',
      'Bath': '🛁',
      'Garden': '🌱',
      'Test / Check': '🔍',
      'Other': '📋'
    };
    return icons[title] || '📋';
  };

  return (
    <div className="section-container" style={{ 
      marginBottom: 20,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      borderRadius: 16,
      padding: '20px 24px',
      border: '1px solid rgba(102,126,234,0.1)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      transition: 'all 0.2s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '20px 20px 0 0'
      }} />
      <h3 className="section-title" style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        margin: '0 0 16px 0', 
        color: '#1a202c',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingBottom: 12,
        borderBottom: '2px solid rgba(102,126,234,0.15)'
      }}>
        <span style={{ 
          fontSize: 20, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)'
        }}>
          {getSectionIcon(title)}
        </span>
        <span>{title}</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function ChecklistItem({ label, type, options, note, value, onChange }: {
  label: string;
  type: string;
  options?: string[];
  note?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Detect if we're on mobile (client-side)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const baseInputStyle = {
    fontSize: 13, 
    padding: '8px 12px', 
    borderRadius: 8, 
    border: '1px solid rgba(0,0,0,0.1)', 
    color: '#1a202c', 
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  // Mobile styles
  const mobileContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    gap: 12,
    padding: '16px',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    border: '1px solid rgba(102,126,234,0.15)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  };

  const mobileLabelStyle = {
    width: '100%',
    fontWeight: 600,
    color: '#1a202c',
    lineHeight: 1.4,
    fontSize: 15,
    display: 'block',
    marginBottom: 8
  };

  // Desktop styles (original)
  const desktopContainerStyle = {
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: 16, 
    padding: '12px 16px',
    marginBottom: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    border: '1px solid rgba(102,126,234,0.08)',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  };

  const desktopLabelStyle = {
    minWidth: 240, 
    fontWeight: 500, 
    color: '#374151',
    lineHeight: 1.4,
    fontSize: 13,
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 1
  };

  return (
    <div className="checklist-item" style={isMobile ? mobileContainerStyle : desktopContainerStyle}>
      {/* Label - First element */}
      <div className="field-label" style={isMobile ? mobileLabelStyle : desktopLabelStyle}>
        {label}
      </div>
      
      {/* Input Container - Second element */}
      <div className="input-container" style={isMobile ? {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      } : {
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 6,
        minWidth: 0
      }}>
        {/* Input Field */}
        <div className="input-field" style={isMobile ? { width: '100%' } : {}}>
      {type === 'select' && options ? (
            <select 
              className={`field-select ${!value ? 'field-select-empty' : 'field-select-filled'}`}
              value={value} 
              onChange={e => onChange(e.target.value)} 
              style={isMobile ? {
                width: '100%',
                fontSize: 16,
                padding: '14px 50px 14px 16px',
                borderRadius: 12,
                border: '2px solid rgba(102,126,234,0.3)',
                backgroundColor: '#fff',
                color: '#1a202c',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                boxShadow: '0 3px 10px rgba(102,126,234,0.1)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                fontWeight: 500,
                outline: 'none',
                background: 'white url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3e%3cpath d=\'M6 8l4 4 4-4\' stroke=\'%23667eea\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3e%3c/svg%3e") no-repeat right 16px center',
                backgroundSize: '18px'
              } : {
                minWidth: 160,
                fontSize: 13,
                padding: '10px 36px 10px 12px',
                borderRadius: 8,
                border: '1.5px solid rgba(102,126,234,0.2)',
                backgroundColor: '#fff',
                color: '#374151',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                boxShadow: '0 2px 6px rgba(102,126,234,0.08)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                fontWeight: 500,
                outline: 'none',
                background: 'white url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3e%3cpath d=\'M6 8l4 4 4-4\' stroke=\'%23667eea\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3e%3c/svg%3e") no-repeat right 12px center',
                backgroundSize: '14px'
              }}
            >
              {options.map((opt, index) => (
                <option key={opt} value={opt}>
                  {opt === '' ? 'Select option...' : opt}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea 
              className="field-textarea"
              value={value} 
              onChange={e => onChange(e.target.value)} 
              style={isMobile ? {
                ...baseInputStyle,
                width: '100%',
                fontSize: 16,
                padding: '14px 16px',
                borderRadius: 12,
                border: '2px solid rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
                minHeight: 80,
                resize: 'vertical' as const,
                lineHeight: 1.5
              } : {
                ...baseInputStyle,
                minWidth: 280,
                minHeight: 60,
                resize: 'vertical' as const,
                lineHeight: 1.4
              }}
              rows={isMobile ? 3 : 2}
              placeholder="Add your notes here..."
            />
          ) : (
            <input 
              className="field-input"
              type="text" 
              value={value} 
              onChange={e => onChange(e.target.value)} 
              style={isMobile ? {
                ...baseInputStyle,
                width: '100%',
                fontSize: 16,
                padding: '14px 16px',
                borderRadius: 12,
                border: '2px solid rgba(0,0,0,0.15)',
                backgroundColor: '#fff'
              } : {
                ...baseInputStyle,
                minWidth: 200
              }}
              placeholder="Enter details..."
            />
          )}
        </div>
        
        {/* Note - Third element */}
        {note && (
          <div className="field-note" style={isMobile ? {
            color: '#666',
            fontSize: 13,
            fontStyle: 'italic',
            lineHeight: 1.4,
            padding: '10px 14px',
            backgroundColor: 'rgba(102,126,234,0.08)',
            borderRadius: 10,
            border: '1px solid rgba(102,126,234,0.15)',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            width: '100%',
            boxSizing: 'border-box'
          } : {
            color: '#6b7280', 
            fontSize: 11, 
            fontStyle: 'italic',
            lineHeight: 1.3,
            padding: '6px 8px',
            backgroundColor: 'rgba(102,126,234,0.05)',
            borderRadius: 8,
            border: '1px solid rgba(102,126,234,0.1)',
            wordWrap: 'break-word',
            wordBreak: 'break-word'
          }}>
            💡 {note}
          </div>
        )}
      </div>
    </div>
  );
}
