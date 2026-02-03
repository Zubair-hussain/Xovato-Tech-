import { NextResponse } from 'next/server';

// ✅ COMPREHENSIVE REGION LIST (Explicitly Excluding IL)
const COUNTRY_NAMES: Record<string, string> = {
  // North America
  US: "United States", CA: "Canada", MX: "Mexico",
  
  // Europe
  GB: "United Kingdom", DE: "Germany", FR: "France", IT: "Italy", ES: "Spain",
  NL: "Netherlands", SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland",
  CH: "Switzerland", BE: "Belgium", AT: "Austria", PL: "Poland", PT: "Portugal",
  GR: "Greece", IE: "Ireland", CZ: "Czech Republic", RO: "Romania", HU: "Hungary",
  
  // Asia
  PK: "Pakistan", IN: "India", CN: "China", JP: "Japan", KR: "South Korea",
  ID: "Indonesia", MY: "Malaysia", SG: "Singapore", TH: "Thailand", VN: "Vietnam",
  PH: "Philippines", BD: "Bangladesh", LK: "Sri Lanka", NP: "Nepal",
  
  // Middle East (Selected)
  AE: "United Arab Emirates", SA: "Saudi Arabia", TR: "Turkey", EG: "Egypt",
  QA: "Qatar", KW: "Kuwait", OM: "Oman", BH: "Bahrain", JO: "Jordan", LB: "Lebanon",
  
  // South America
  BR: "Brazil", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
  
  // Oceania
  AU: "Australia", NZ: "New Zealand",
  
  // Africa
  ZA: "South Africa", NG: "Nigeria", KE: "Kenya", GH: "Ghana", MA: "Morocco",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 1. Validation
  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("❌ SERPAPI_KEY is missing in .env file");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // 2. Detect User's Country
  let countryCode = request.headers.get("x-vercel-ip-country") || "US"; 

  // 🛡️ SECURITY: Explicitly block excluded regions (Israel) and fallback to Global (US)
  if (countryCode === 'IL') {
      countryCode = 'US'; 
  }

  // Get full name, default to US if code not in our list
  const countryName = COUNTRY_NAMES[countryCode] || "United States";

  try {
    // 3. Construct Localized Query
    const searchQuery = `average cost ${query} development in ${countryName} 2025`;

    console.log(`🔎 Scanning Market: ${searchQuery} (Region: ${countryCode})`);

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&gl=${countryCode.toLowerCase()}&hl=en&currency=USD&api_key=${apiKey}`
    );
    const data = await response.json();

    // 4. Extract Price Logic
    let foundPrice = null;
    
    // Check answer box (Google's direct answer) or first result snippet
    const textToCheck = data.answer_box?.snippet || data.organic_results?.[0]?.snippet || "";
    
    // Regex to find USD price (e.g., $5,000)
    const usdMatch = textToCheck.match(/\$([0-9,]+)/);
    
    if (usdMatch && usdMatch[1]) {
        foundPrice = parseInt(usdMatch[1].replace(/,/g, ''), 10);
    } else {
        // Fallback: Find any large number (1000+) if exact currency symbol is missing
        const numberMatch = textToCheck.match(/([0-9,]{4,})/); 
        if (numberMatch) {
             foundPrice = parseInt(numberMatch[1].replace(/,/g, ''), 10);
        }
    }

    return NextResponse.json({ 
        price: foundPrice, 
        location: countryName,
        source: "Live Regional Data" 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}