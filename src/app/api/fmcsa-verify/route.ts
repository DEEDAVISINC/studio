
import { type NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Replace this with the actual base URL for your FMCSA API
const FMCSA_API_BASE_URL = 'https://example-fmcsa-api.com/v1/carrier'; 

// This is a simplified example. Your actual FMCSA API might return different data or require different parameters.
// You will need to adjust the request and response handling based on YOUR API's documentation.
interface FmcsaApiResponse {
  // Example structure - adjust to your API's response
  authorityStatus?: 'Active' | 'Inactive' | 'Not Authorized' | 'Pending';
  carrierName?: string;
  operatingStatus?: string;
  // Add other fields your API returns
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mcNumber = searchParams.get('mcNumber');
  const usDotNumber = searchParams.get('usDotNumber');
  const apiKey = process.env.FMCSA_API_KEY;

  if (!apiKey) {
    console.error('FMCSA API Key is not configured.');
    return NextResponse.json({ error: 'Server configuration error: FMCSA API Key missing.' }, { status: 500 });
  }

  if (!mcNumber && !usDotNumber) {
    return NextResponse.json({ error: 'MC Number or US DOT Number is required.' }, { status: 400 });
  }

  // Construct your API request URL
  // This is an example, you might need to adjust parameters based on your API
  let apiUrl = FMCSA_API_BASE_URL;
  const queryParams = new URLSearchParams();
  if (usDotNumber) queryParams.append('dotNumber', usDotNumber);
  else if (mcNumber) queryParams.append('mcNumber', mcNumber); // Or whatever your API expects

  // IMPORTANT: Your API might require the API key in headers or a different query param name
  // queryParams.append('apiKey', apiKey); // Example if key is in query
  
  apiUrl = `${apiUrl}?${queryParams.toString()}`;

  try {
    // IMPORTANT: Adjust fetch options (headers, method, body if POST) as per your FMCSA API requirements.
    const response = await fetch(apiUrl, {
      method: 'GET', // Or 'POST', etc.
      headers: {
        // Example if API key is in header:
        'Authorization': `Bearer ${apiKey}`, 
        // 'X-Api-Key': apiKey, // Another common header for API keys
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`FMCSA API error: ${response.status} ${response.statusText}`, errorData);
      return NextResponse.json({ error: `Failed to fetch data from FMCSA API: ${response.statusText}` }, { status: response.status });
    }

    const data: FmcsaApiResponse = await response.json();

    // --- USER CUSTOMIZATION POINT ---
    // Map the response from YOUR FMCSA API to the FmcsaAuthorityStatus type
    // This is a simplified mapping. You'll need to adapt this logic.
    let appStatus: FmcsaAuthorityStatus = 'Verification Failed';
    if (data.authorityStatus) {
        switch (data.authorityStatus.toLowerCase()) {
            case 'active':
                appStatus = 'Verified Active';
                break;
            case 'inactive':
                appStatus = 'Verified Inactive';
                break;
            case 'not authorized':
            case 'pending': // Example: Treating API's 'Pending' as 'Verified Inactive' or a custom status
                appStatus = 'Verified Inactive'; // Or 'Pending Verification' if you add that to FmcsaAuthorityStatus
                break;
            default:
                appStatus = 'Verification Failed'; // Or handle unknown statuses
        }
    } else if (data.operatingStatus && data.operatingStatus.toLowerCase() === "in service") {
      // Fallback if authorityStatus is not present but operatingStatus is
      appStatus = 'Verified Active';
    }
    // --- END USER CUSTOMIZATION POINT ---


    return NextResponse.json({ 
        status: appStatus, 
        details: data, // Send back the full details if needed by the frontend
        message: "Successfully fetched FMCSA data."
    });

  } catch (error) {
    console.error('Error calling FMCSA API route:', error);
    return NextResponse.json({ error: 'Internal server error while contacting FMCSA API.' }, { status: 500 });
  }
}

// To ensure this route is dynamically evaluated
export const dynamic = 'force-dynamic';
