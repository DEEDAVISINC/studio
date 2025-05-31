
import { type NextRequest, NextResponse } from 'next/server';
import type { FmcsaAuthorityStatus } from '@/lib/types';

// --- PRODUCTION FMCSA API CUSTOMIZATION ---
const FMCSA_API_BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services';
// Example: /carriers endpoint. You might need to change this.
const FMCSA_API_ENDPOINT_PATH = '/carriers';

// This is an EXAMPLE structure for the FMCSA Query Central API.
// You MUST adjust this to match the ACTUAL JSON response from the service you are using.
interface MyFmcsaApiResponse {
  carrier?: { // Often the data is nested
    legalName?: string;
    operatingStatus?: string; // e.g., "AUTHORIZED FOR Property", "NOT AUTHORIZED", "INACTIVE USDOT Number"
    authorityTypes?: { authorityType?: string; status?: string }[]; // Array of authorities
    safetyRating?: { // Safety Rating might be nested
      rating?: string; // e.g., "Satisfactory", "Conditional", "Unsatisfactory"
      ratingDate?: string;
    };
    powerUnits?: string; // FMCSA API often returns numbers as strings
    mcs150FormDate?: string; // Date string
    operationClassification?: string;
    carrierOperation?: string; // e.g., "INTERSTATE", "INTRASTATE"
    // Add other relevant fields your specific API endpoint returns
  };
  messages?: { code?: string; message?: string }[]; // For errors or informational messages
}
// --- END FMCSA API CUSTOMIZATION ---

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mcNumber = searchParams.get('mcNumber');
  const usDotNumber = searchParams.get('usDotNumber');

  // API Key (Web Key) Handling - Assuming it's passed as 'webKey' query parameter
  const apiKey = process.env.FMCSA_API_KEY;

  if (!apiKey) {
    console.error('FMCSA API Key/Web Key (FMCSA_API_KEY) is not configured in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: FMCSA API Key/Web Key missing.' }, { status: 500 });
  }

  if (!mcNumber && !usDotNumber) {
    return NextResponse.json({ error: 'MC Number or US DOT Number is required.' }, { status: 400 });
  }

  // API URL Construction
  const queryParams = new URLSearchParams();
  queryParams.append('webKey', apiKey); // Common way to pass API key for FMCSA services

  if (usDotNumber) {
    queryParams.append('USDOTNumber', usDotNumber); // Common parameter name
  } else if (mcNumber) {
    queryParams.append('MCNumber', mcNumber); // Common parameter name
  }
  // queryParams.append('format', 'json'); // Often needed if the API supports multiple formats

  const apiUrl = `${FMCSA_API_BASE_URL}${FMCSA_API_ENDPOINT_PATH}?${queryParams.toString()}`;

  try {
    console.log(`Fetching FMCSA data from: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        // FMCSA services usually don't require custom content-type headers for GET if using query params
        // 'Content-Type': 'application/json', // Only if sending a JSON body for POST/PUT
        'Accept': 'application/json', // Good practice to specify accepted response type
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        // Try to parse error as JSON first
        errorData = await response.json();
      } catch (e) {
        // Fallback to text if JSON parsing fails
        errorData = { message: await response.text() };
      }
      console.error(`FMCSA API error: ${response.status} ${response.statusText}`, errorData);
      return NextResponse.json({
        error: `Failed to fetch data from FMCSA API: ${errorData?.message || response.statusText}`
      }, { status: response.status });
    }

    const data: MyFmcsaApiResponse = await response.json();

    // Check for API-level errors if the HTTP status was OK but API returned an error message
    if (data.messages && data.messages.some(m => m.code && parseInt(m.code, 10) >= 400)) {
        const apiError = data.messages.find(m => m.code && parseInt(m.code, 10) >= 400);
        console.warn('FMCSA API returned an error message:', apiError);
        return NextResponse.json({
            status: 'Verification Failed' as FmcsaAuthorityStatus,
            details: data.carrier, // Send carrier details if any
            message: apiError?.message || "Carrier data not found or API error."
        });
    }

    if (!data.carrier || !data.carrier.legalName) { // Check if essential carrier data is present
      return NextResponse.json({
        status: 'Verification Failed' as FmcsaAuthorityStatus,
        details: data.carrier,
        message: "Carrier not found or essential details missing in API response."
      });
    }

    // --- USER CUSTOMIZATION POINT: Map API response to FmcsaAuthorityStatus ---
    let appStatus: FmcsaAuthorityStatus = 'Verification Failed';
    const carrierDetails = data.carrier;
    const operatingStatus = carrierDetails.operatingStatus?.toUpperCase() || "";

    if (operatingStatus.includes("AUTHORIZED FOR")) {
        // Further check for authority types if needed, e.g., ensure 'Property' authority is active
        // const hasActivePropertyAuthority = carrierDetails.authorityTypes?.some(
        //    auth => auth.authorityType?.toUpperCase() === 'PROPERTY' && auth.status?.toUpperCase() === 'ACTIVE'
        // );
        // if (hasActivePropertyAuthority) {
        //    appStatus = 'Verified Active';
        // } else {
        //    appStatus = 'Verified Inactive'; // Or a more specific status
        // }
        appStatus = 'Verified Active'; // Simplified for now
    } else if (operatingStatus.includes("NOT AUTHORIZED") || operatingStatus.includes("INACTIVE")) {
        appStatus = 'Verified Inactive';
    } else if (operatingStatus === "") { // If operating status is blank, could mean out of service or similar
        appStatus = 'Verified Inactive';
    } else {
        // If status is something unexpected or not clearly active/inactive based on primary field
        appStatus = 'Verification Failed'; // Default to failed if cannot determine
    }

    // You might also consider safety rating:
    // const safetyRating = carrierDetails.safetyRating?.rating?.toUpperCase();
    // if (appStatus === 'Verified Active' && safetyRating === 'UNSATISFACTORY') {
    //   appStatus = 'Verified Inactive'; // Or a custom status like 'Active - Unsatisfactory Safety'
    // }
    // --- END USER CUSTOMIZATION POINT ---

    // Extracting additional details for the Carrier object in AppDataContext
    const carrierUpdateDetails: Partial<import('@/lib/types').Carrier> = {
        name: carrierDetails.legalName || '',
        // dba: carrierDetails.dbaName || undefined, // If your API provides DBA
        usDotNumber: usDotNumber || undefined,
        mcNumber: mcNumber || undefined,
        // companyPhone: carrierDetails.phone || undefined,
        // physicalAddress: `${carrierDetails.phyStreet || ''}, ${carrierDetails.phyCity || ''}, ${carrierDetails.phyState || ''} ${carrierDetails.phyZipcode || ''}`.trim(),
        powerUnits: carrierDetails.powerUnits ? parseInt(carrierDetails.powerUnits, 10) : undefined,
        mcs150FormDate: carrierDetails.mcs150FormDate ? new Date(carrierDetails.mcs150FormDate) : undefined,
        operationClassification: carrierDetails.operationClassification || undefined,
        carrierOperationType: carrierDetails.carrierOperation || undefined,
        fmcsaAuthorityStatus: appStatus,
        fmcsaLastChecked: new Date(),
    };


    return NextResponse.json({
        status: appStatus,
        details: carrierUpdateDetails, // Send back the structured details we want to update
        message: "Successfully fetched and processed FMCSA data."
    });

  } catch (error: any) {
    console.error('Error calling FMCSA API route:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// Ensure this route is dynamically evaluated if it depends on headers or cookies,
// or if you want it to run on every request in development.
export const dynamic = 'force-dynamic';

    