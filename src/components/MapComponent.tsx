import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayerGroup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationData } from '../types/types';
import '../styles/MapComponent.css';

// Fix default icon issues in Leaflet
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for favorite locations
const favoriteIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for selected location
const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to update map view when props change
const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    
    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);
    
    return null;
};

interface MapComponentProps {
    locations: LocationData[];
    selectedLocation: LocationData | null;
    onLocationSelect: (location: LocationData) => void;
    mapView: 'standard' | 'satellite';
    favoriteLocations: LocationData[];
}

export const MapComponent = ({ 
    locations, 
    selectedLocation, 
    onLocationSelect,
    mapView,
    favoriteLocations
}: MapComponentProps) => {
    const mapRef = useRef<L.Map | null>(null);
    
    const center = selectedLocation 
        ? [selectedLocation.lat, selectedLocation.lon] as [number, number]
        : locations.length > 0 
            ? [locations[0].lat, locations[0].lon] as [number, number]
            : [40, 0] as [number, number]; // Default center

    const zoom = selectedLocation ? 10 : locations.length > 0 ? 3 : 2;

    // Determine if a location is a favorite
    const isLocationFavorite = (location: LocationData) => {
        return favoriteLocations.some(favLoc => 
            favLoc.name === location.name && 
            favLoc.lat === location.lat &&
            favLoc.lon === location.lon
        );
    };

    // Choose the appropriate icon based on location status
    const getMarkerIcon = (location: LocationData) => {
        if (selectedLocation && 
            location.lat === selectedLocation.lat && 
            location.lon === selectedLocation.lon) {
            return selectedIcon;
        }
        if (isLocationFavorite(location)) {
            return favoriteIcon;
        }
        return defaultIcon;
    };

    const tileLayerUrl = mapView === 'standard' 
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const attribution = mapView === 'standard'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    return (
        <div className="map-container">
            <MapContainer
                center={center}
                zoom={zoom}
                ref={mapRef}
                style={{ height: '100%', width: '100%' }}
                className="map"
            >
                <TileLayer
                    url={tileLayerUrl}
                    attribution={attribution}
                />
                <MapUpdater center={center} zoom={zoom} />
                
                {locations.map((location, index) => (
                    <Marker
                        key={index}
                        position={[location.lat, location.lon]}
                        icon={getMarkerIcon(location)}
                        eventHandlers={{
                            click: () => onLocationSelect(location),
                        }}
                    >
                        <Popup>
                            <div className="location-popup">
                                <strong>{location.name.split(',')[0]}</strong>
                                <p>{location.description?.substring(0, 100)}...</p>
                                <button onClick={() => onLocationSelect(location)}>
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                {selectedLocation && (
                    <LayerGroup>
                        <Circle 
                            center={[selectedLocation.lat, selectedLocation.lon]}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                            radius={50000} // 50km radius
                        />
                    </LayerGroup>
                )}
            </MapContainer>
        </div>
    );
};