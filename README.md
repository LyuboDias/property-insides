# Property Insides

A comprehensive property investment analysis tool designed for UK property investors. This application helps property investors analyze buy-to-let deals, scrape property data from RightMove, and systematically evaluate properties using a comprehensive viewing checklist

## Features

### 🏠 Property Data Scraping
- **RightMove Integration**: Automatically extract property details from RightMove listings
- **Comprehensive Data Extraction**: Address, price, property type, bedrooms, bathrooms, key features, descriptions, agent details, and images
- **Smart Parsing**: Handles multiple RightMove page layouts and formats

### 📊 Buy-to-Let Deal Calculator
- **Investment Analysis**: Calculate total investment requirements including stamp duty, deposits, and fees
- **ROI & Yield Calculations**: Compute gross yield, net yield, and return on investment
- **Mortgage Analysis**: Support for both interest-only and repayment mortgages
- **Stress Testing**: Rental cover calculations with configurable stress rates
- **Future Projections**: Property value estimates after 2 and 5 years with capital gains
- **CSV Export**: Download detailed analysis results for record-keeping
- **SDLT Calculations**: Automatic Stamp Duty Land Tax calculation for second homes/buy-to-let properties

### ✅ Property Viewing Checklist
- **Systematic Property Evaluation**: Comprehensive checklist covering all aspects of property inspection
- **Categorized Inspection**: Organized sections for exterior, interior, security, utilities, and more
- **Digital & Printable**: Use on mobile devices or print for physical viewings
- **Data Export**: Export completed checklists as CSV files
- **Professional Standards**: Based on industry best practices for property assessment

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: CSS-in-JS with inline styles
- **Web Scraping**: Cheerio for server-side HTML parsing
- **Data Export**: CSV generation for analysis results and checklists
- **Development**: TypeScript with strict mode, ESLint

## System Requirements

- **Node.js**: Version 18.0 or higher (tested with v20.14.0)
- **npm**: Version 8.0 or higher (tested with v10.7.0)
- **Browser**: Modern web browser with JavaScript enabled

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd property-insides
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Usage Guide

### Property Scraping
1. Navigate to the home page
2. Paste a RightMove property URL into the input field
3. Click "Scrape Property Info" to extract details
4. View the extracted property information in a structured table

### Deal Analysis
1. Go to the Calculator page (`/calculator`)
2. Fill in property details (address, price, etc.)
3. Enter financial parameters (mortgage rate, deposit, rental income)
4. Click "Calculate" to generate comprehensive analysis
5. Download results as CSV for record-keeping

### Property Viewing
1. Navigate to the Checklist page (`/checklist`)
2. Fill out the systematic property inspection checklist
3. Use during property viewings for consistent evaluation
4. Export completed checklist as CSV

## Key Calculations

### Stamp Duty Land Tax (SDLT)
- Calculated for second homes/buy-to-let properties in England
- Includes additional 3% surcharge on top of standard rates
- Rates: 3% (up to £250k), 8% (£250k-£925k), 13% (£925k-£1.5M), 15% (above £1.5M)

### Yield Calculations
- **Gross Yield**: (Annual Rental Income ÷ Property Value) × 100
- **Net Yield**: ((Annual Rental Income - Annual Expenses) ÷ Property Value) × 100

### Return on Investment (ROI)
- **Standard ROI**: (Annual Net Profit ÷ Total Investment) × 100  
- **5-Year ROI**: ((5 Years Net Profit + Capital Gains) ÷ Total Investment) × 100

## Project Structure

```
property-insides/
├── app/
│   ├── api/
│   │   └── scrape-rightmove/
│   │       └── route.ts          # RightMove scraping API endpoint
│   ├── calculator/
│   │   └── page.tsx              # Buy-to-let deal calculator
│   ├── checklist/
│   │   └── page.tsx              # Property viewing checklist
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page with property scraper
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── next.config.ts               # Next.js configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms specified in the LICENSE file.

## Disclaimer

This tool is for informational purposes only and should not be considered as financial advice. Always consult with qualified financial advisors and conduct proper due diligence before making property investment decisions. The accuracy of scraped data depends on the source website's structure and may change over time.
