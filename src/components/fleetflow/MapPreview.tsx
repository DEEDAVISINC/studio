
"use client";
import type {DirectionsResult} from '@googlemaps/google-maps-services-js';
import {GoogleMap, LoadScript, DirectionsService, DirectionsRenderer} from '@react-google-maps/api';
import {useState, useEffect, useCallback} from 'react';
import {Loader2, MapPinOff} from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

// A default center, e.g., center of USA.
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

interface MapPreviewProps {
  apiKey: string | undefined;
  origin: string;
  destination: string;
}

export function MapPreview({apiKey, origin, destination}: MapPreviewProps) {
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To manage initial DirectionsService loading

  const directionsCallback = useCallback((response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    setIsLoading(false);
    if (status === 'OK' && response) {
      setDirections(response);
      setError(null);
    } else {
      console.error(`Directions request failed due to ${status}`);
      setError(`Could not retrieve directions: ${status}. Ensure locations are valid addresses or landmarks.`);
      setDirections(null);
    }
  }, []);
  
  // Effect to reset directions when origin or destination changes
  useEffect(() => {
    setDirections(null); // Clear previous directions
    setError(null);
    setIsLoading(true); // Set loading true for new request
  }, [origin, destination]);


  if (!apiKey) {
    return (
      <div className="mt-6 p-4 border-2 border-dashed border-destructive/50 rounded-lg text-center bg-destructive/10 text-destructive">
        <MapPinOff className="mx-auto h-10 w-10 mb-2" />
        <p className="font-semibold">Google Maps API Key Missing</p>
        <p className="text-sm">Please set up the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable to display the map.</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={4}>
        {origin && destination && (
          <DirectionsService
            // only call this when origin and destination are set and directions are not yet fetched
            options={{
              destination: destination,
              origin: origin,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={directionsCallback}
            // Prevent re-fetching on every render unless origin/destination changes
            // This is handled by the useEffect resetting directions
            onLoad={() => setIsLoading(true)} // Reset loading on new service instance (if it re-creates)
          />
        )}
        {isLoading && !directions && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading route...</p>
          </div>
        )}
        {error && !isLoading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center">
            <MapPinOff className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
        {directions && !isLoading && <DirectionsRenderer options={{directions: directions}} />}
      </GoogleMap>
    </LoadScript>
  );
}
