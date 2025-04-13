import { LocationData } from '../types/types';
import '../styles/LocationInfo.css';

interface LocationInfoProps {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
    onAddToFavorites?: () => void;
    onRemoveFromFavorites?: () => void;
    isFavorite: boolean;
}

export const LocationInfo = ({ 
    location, 
    loading, 
    error, 
    onAddToFavorites,
    onRemoveFromFavorites,
    isFavorite
}: LocationInfoProps) => {
    if (loading) {
        return <div className="location-info loading">Loading location information...</div>;
    }

    if (error) {
        return <div className="location-info error">{error}</div>;
    }

    if (!location) {
        return <div className="location-info empty">Select a location on the map to see details</div>;
    }

    // Format location name to be more readable
    const locationName = location.name.split(',')[0];

    return (
        <div className="location-info">
            <div className="location-header">
                <h3>{locationName}</h3>
                {isFavorite ? (
                    <button 
                        className="favorite-btn remove" 
                        onClick={onRemoveFromFavorites}
                        title="Remove from favorites"
                    >
                        ★ Remove from favorites
                    </button>
                ) : (
                    <button 
                        className="favorite-btn add" 
                        onClick={onAddToFavorites}
                        title="Add to favorites"
                    >
                        ☆ Add to favorites
                    </button>
                )}
            </div>
            
            {location.image && (
                <img src={location.image} alt={locationName} className="location-image" />
            )}
            
            <div className="location-coordinates">
                <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
                <p><strong>Type:</strong> {location.type || 'Location'}</p>
            </div>
            
            <div className="location-description">
                <h4>About {locationName}</h4>
                <p>{location.description}</p>
            </div>
            
            {location.wikipediaExtract && (
                <div className="wikipedia-info">
                    <p className="info-source">
                        <a 
                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(locationName)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="wikipedia-link"
                        >
                            Read more on Wikipedia
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
};