import { useState, useEffect } from 'react';
import { useApi } from './hooks/useApi.ts';
import 'leaflet/dist/leaflet.css'
import { fetchMovieData, fetchLocationInfo } from './services/api.ts';
import { SearchBar } from './components/SearchBar.tsx';
import { MovieInfo } from './components/MovieInfo.tsx';
import { LocationInfo } from './components/LocationInfo.tsx';
import { MapComponent } from './components/MapComponent.tsx';
import { Loader } from './components/Loader.tsx';
import { Movie, LocationData } from './types/types.ts';
import './App.css';

export const App = () => {
    const [movieQuery, setMovieQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
    const [favLocations, setFavLocations] = useState<LocationData[]>([]);
    const [activeTab, setActiveTab] = useState<'movie' | 'location'>('movie');
    
    const { data: movie, loading: movieLoading, error: movieError } = useApi<Movie | null>(
        () => movieQuery ? fetchMovieData(movieQuery) : Promise.resolve(null),
        [movieQuery]
    );
    
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [locationsError, setLocationsError] = useState<string | null>(null);

    const handleSearch = (query: string) => {
        setMovieQuery(query);
        setSelectedLocation(null);
        setLocations([]);
        setActiveTab('movie');
    };

    const handleLocationNameSelect = (locationName: string) => {
        // Buscar la ubicación por nombre
        const location = locations.find(loc => 
            loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
            locationName.toLowerCase().includes(loc.name.split(',')[0].toLowerCase())
        );
        
        if (location) {
            handleLocationSelect(location);
        }
    };

    useEffect(() => {
        const fetchLocations = async () => {
            if (movie && movie.locations && movie.locations.length > 0) {
                setLocationsLoading(true);
                setLocationsError(null);
                
                try {
                    const locationPromises = movie.locations.map(loc => fetchLocationInfo(loc));
                    const locationResults = await Promise.all(locationPromises);
                    setLocations(locationResults.filter(loc => loc !== null) as LocationData[]);
                } catch (error) {
                    setLocationsError(error instanceof Error ? error.message : 'Failed to fetch location data');
                } finally {
                    setLocationsLoading(false);
                }
            }
        };
        
        fetchLocations();
    }, [movie]);

    const handleLocationSelect = (location: LocationData) => {
        setSelectedLocation(location);
        setActiveTab('location');
    };

    const handleTabChange = (tab: 'movie' | 'location') => {
        setActiveTab(tab);
        // Forzar el redimensionamiento del mapa después de un breve retraso al cambiar pestañas
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    };

    const toggleMapView = () => {
        setMapView(prev => prev === 'standard' ? 'satellite' : 'standard');
    };

    const addToFavorites = (location: LocationData) => {
        if (!favLocations.some(loc => loc.name === location.name)) {
            setFavLocations([...favLocations, location]);
            // Guardar en localStorage
            try {
                const storedFavorites = [...favLocations, location];
                localStorage.setItem('favoriteLocations', JSON.stringify(storedFavorites));
            } catch (error) {
                console.error('Error saving favorites to localStorage:', error);
            }
        }
    };

    const removeFromFavorites = (location: LocationData) => {
        const updatedFavorites = favLocations.filter(loc => loc.name !== location.name);
        setFavLocations(updatedFavorites);
        // Actualizar localStorage
        try {
            localStorage.setItem('favoriteLocations', JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error updating favorites in localStorage:', error);
        }
    };

    // Cargar favoritos desde localStorage al iniciar
    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('favoriteLocations');
            if (storedFavorites) {
                setFavLocations(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
        }
    }, []);

    const isLocationFavorite = (location: LocationData) => {
        return favLocations.some(loc => loc.name === location.name);
    };

    // Forzar un redimensionamiento del mapa cuando la ventana cambia de tamaño
    useEffect(() => {
        const handleResize = () => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="app">
            <header>
                <h1>🎬 CinemaMap Explorer</h1>
                <p>Discover where your favorite movies were filmed and learn about those places</p>
                <SearchBar onSearch={handleSearch} loading={movieLoading} />
            </header>
            
            <div className="content">
                <div className="sidebar">
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'movie' ? 'active' : ''}`}
                            onClick={() => handleTabChange('movie')}
                        >
                            Movie Info
                        </button>
                        <button 
                            className={`tab ${activeTab === 'location' ? 'active' : ''}`}
                            onClick={() => handleTabChange('location')}
                            disabled={!selectedLocation}
                        >
                            Location Details
                        </button>
                    </div>
                    
                    <div className="tab-content">
                        {activeTab === 'movie' ? (
                            movieLoading ? (
                                <Loader />
                            ) : (
                                <MovieInfo 
                                    movie={movie} 
                                    error={movieError} 
                                    onLocationSelect={handleLocationNameSelect}
                                />
                            )
                        ) : (
                            locationsLoading ? (
                                <Loader />
                            ) : (
                                <LocationInfo 
                                    location={selectedLocation} 
                                    loading={false} 
                                    error={locationsError}
                                    onAddToFavorites={selectedLocation ? 
                                        () => addToFavorites(selectedLocation) : undefined}
                                    onRemoveFromFavorites={selectedLocation ? 
                                        () => removeFromFavorites(selectedLocation) : undefined}
                                    isFavorite={selectedLocation ? isLocationFavorite(selectedLocation) : false}
                                />
                            )
                        )}
                    </div>
                    
                    {favLocations.length > 0 && (
                        <div className="favorites">
                            <h3>Favorite Locations</h3>
                            <ul>
                                {favLocations.map((loc, idx) => (
                                    <li key={`fav-${idx}-${loc.name}`} onClick={() => {
                                        setSelectedLocation(loc);
                                        handleTabChange('location');
                                    }}>
                                        {loc.name.split(',')[0]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <div className="map-container">
                    <div className="map-controls">
                        <button onClick={toggleMapView}>
                            {mapView === 'standard' ? 'Switch to Satellite' : 'Switch to Standard'}
                        </button>
                    </div>
                    <MapComponent 
                        locations={locations} 
                        selectedLocation={selectedLocation} 
                        onLocationSelect={handleLocationSelect}
                        mapView={mapView}
                        favoriteLocations={favLocations}
                    />
                </div>
            </div>
            
            <footer>
                <p>Created with React, TypeScript, and react-leaflet | Data from OMDb API and Wikipedia API</p>
            </footer>
        </div>
    );
};