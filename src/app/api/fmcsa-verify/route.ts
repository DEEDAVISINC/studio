
import { type NextRequest, NextResponse } from 'next/server';
import type { FmcsaAuthorityStatus } from '@/lib/types'; // Import the FmcsaAuthorityStatus type

// --- EXAMPLE CUSTOMIZATION START ---
// IMPORTANT: Replace this with the actual base URL for YOUR FMCSA API
const FMCSA_API_BASE_URL = 'https://my-real-fmcsa-api.example.com/api/v2/carrier-info'; 

// This is an EXAMPLE structure. Adjust to match YOUR FMCSA API's response.
interface MyFmcsaApiResponse {
  query: {
    identifierType: 'USDOT' | 'MC';
    identifierValue: string;
  };
  carrierDetails?: {
    legalName: string;
    operatingStatus: 'ACTIVE' | 'INACTIVE_PENDING_REMOVAL' | 'NOT_AUTHORIZED' | 'INACTIVE';
    authorityType?: string; // e.g., "COMMON", "CONTRACT"
    safetyRating?: string; // e.g., "Satisfactory", "Conditional"
    // Add other relevant fields your API returns
  };
  error?: string;
  message?: string;
}
// --- EXAMPLE CUSTOMIZATION END ---

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mcNumber = searchParams.get('mcNumber');
  const usDotNumber = searchParams.get('usDotNumber');
  
  // --- EXAMPLE CUSTOMIZATION: API Key Handling ---
  // Ensure your API key is set in .env.local or your server environment
  const apiKey = process.env.FMCSA_API_KEY; 

  if (!apiKey) {
    console.error('FMCSA API Key (FMCSA_API_KEY) is not configured in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: FMCSA API Key missing.' }, { status: 500 });
  }

  if (!mcNumber && !usDotNumber) {
    return NextResponse.json({ error: 'MC Number or US DOT Number is required.' }, { status: 400 });
  }

  // --- EXAMPLE CUSTOMIZATION: API URL Construction ---
  const queryParams = new URLSearchParams();
  if (usDotNumber) {
    queryParams.append('dot_number', usDotNumber); // Example: API uses 'dot_number'
  } else if (mcNumber) {
    queryParams.append('mc_number', mcNumber); // Example: API uses 'mc_number'
  }
  // IMPORTANT: Some APIs might prefer the identifier in the path, e.g., /api/v2/carrier-info/dot/{usDotNumber}
  const apiUrl = `${FMCSA_API_BASE_URL}?${queryParams.toString()}`;

  try {
    // --- EXAMPLE CUSTOMIZATION: Fetch Options (Headers, Method) ---
    // IMPORTANT: Adjust fetch options as per YOUR FMCSA API requirements.
    const response = await fetch(apiUrl, {
      method: 'GET', // Or 'POST', etc., if your API requires it
      headers: {
        // Example: API key sent in a custom header. Common alternatives:
        // 'Authorization': `Bearer ${apiKey}`,
        // 'api_key': apiKey, (if sent as a query param, add it to queryParams above)
        'X-My-Custom-API-Key': apiKey, 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // body: JSON.stringify({ some_payload_if_post_request }), // Example if it's a POST request
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error as JSON
      } catch {
        errorData = await response.text(); // Fallback to text
      }
      console.error(`FMCSA API error: ${response.status} ${response.statusText}`, errorData);
      return NextResponse.json({ 
        error: `Failed to fetch data from FMCSA API: ${errorData?.message || response.statusText}` 
      }, { status: response.status });
    }

    const data: MyFmcsaApiResponse = await response.json();

    if (data.error || !data.carrierDetails) {
        return NextResponse.json({ 
            status: 'Verification Failed' as FmcsaAuthorityStatus, 
            details: data,
            message: data.message || data.error || "Carrier not found or API error."
        });
    }

    // --- USER CUSTOMIZATION POINT ---
    // Map the response from YOUR FMCSA API to the FmcsaAuthorityStatus type
    // This is an EXAMPLE mapping based on the MyFmcsaApiResponse interface above.
    // You'll need to adapt this logic based on the fields YOUR API returns.
    let appStatus: FmcsaAuthorityStatus = 'Verification Failed';
    const carrierDetails = data.carrierDetails;

    if (carrierDetails) {
        switch (carrierDetails.operatingStatus?.toUpperCase()) {
            case 'ACTIVE':
                // You might add more checks here, e.g., based on authorityType or safetyRating
                appStatus = 'Verified Active';
                break;
            case 'INACTIVE_PENDING_REMOVAL':
            case 'NOT_AUTHORIZED':
            case 'INACTIVE':
                appStatus = 'Verified Inactive';
                break;
            default:
                // If operatingStatus is something else or not present, treat as failed or not verified
                // depending on your API's typical responses for unknown/unfindable carriers.
                appStatus = 'Verification Failed'; 
        }
    } else {
      // If carrierDetails are missing, it implies the carrier wasn't found or an issue occurred.
      appStatus = 'Verification Failed';
    }
    // --- END USER CUSTOMIZATION POINT ---


    return NextResponse.json({ 
        status: appStatus, 
        details: data.carrierDetails, // Send back relevant details if needed by the frontend
        message: data.message || "Successfully fetched FMCSA data."
    });

  } catch (error: any) {
    console.error('Error calling FMCSA API route:', error);
    return NextResponse.json({ error: 'Internal server error while contacting FMCSA API: ' + error.message }, { status: 500 });
  }
}

// To ensure this route is dynamically evaluated if it depends on headers or cookies,
// or if you want it to run on every request in development.
export const dynamic = 'force-dynamic';
