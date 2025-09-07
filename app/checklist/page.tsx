"use client";
import Link from "next/link";
import { useState } from "react";

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
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', color: '#000' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, background: '#fff', borderRight: '1px solid #e5e7eb', minHeight: '100vh', padding: '40px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', color: '#000' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Viewing Checklist</h1>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Essential checks for property viewings</p>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🏠 Home
            </Link>
            <Link href="/calculator" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🧮 Calculator
            </Link>
            <Link href="/checklist" style={{ color: '#0070f3', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, background: '#f0f8ff', fontWeight: 500 }}>
              ✅ Checklist
            </Link>
            <Link href="/property-search" style={{ color: '#666', textDecoration: 'none', fontSize: 14, padding: '8px 12px', borderRadius: 6, transition: 'all 0.2s' }}>
              🔍 Property Search
            </Link>
          </nav>
        </div>
      </aside>
      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }}>
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>PROPERTY VIEWING CHECKLIST</h2>
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
          <div style={{ textAlign: 'right', marginTop: 32 }}>
            <button type="button" style={buttonStyle} onClick={handleDownload}>Download Checklist</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 17, fontWeight: 600, margin: '24px 0 12px 0', color: '#000' }}>{title}</h3>
      <div>{children}</div>
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
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8, color: '#000' }}>
      <div style={{ minWidth: 220, fontWeight: 500 }}>{label}</div>
      {type === 'select' && options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ minWidth: 120, fontSize: 14, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', color: '#000', background: '#f4f6fa' }}>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={{ minWidth: 220, fontSize: 14, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', color: '#000', background: '#f4f6fa' }} rows={2} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ minWidth: 120, fontSize: 14, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', color: '#000', background: '#f4f6fa' }} />
      )}
      {note && <div style={{ color: '#666', fontSize: 13 }}>{note}</div>}
    </div>
  );
}

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