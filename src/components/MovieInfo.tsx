import { Movie } from '../types/types';
import '../styles/MovieInfo.css';

interface MovieInfoProps {
    movie: Movie | null;
    error: string | null;
    onLocationSelect?: (locationName: string) => void;
}

export const MovieInfo = ({ movie, error, onLocationSelect }: MovieInfoProps) => {
    if (error) {
        return <div className="movie-info error">{error}</div>;
    }

    if (!movie) {
        return (
            <div className="movie-info empty">
                <div className="movie-placeholder">
                    <div className="movie-icon">🎬</div>
                    <p>Search for a movie to see information and filming locations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="movie-info">
            <div className="movie-header">
                {movie.poster ? (
                    <img src={movie.poster} alt={`${movie.title} poster`} className="movie-poster" />
                ) : (
                    <div className="no-poster">No poster available</div>
                )}
                <div className="movie-details">
                    <h2>{movie.title} <span className="movie-year">({movie.year})</span></h2>
                    {movie.director && <p><strong>Director:</strong> {movie.director}</p>}
                    {movie.actors && movie.actors.length > 0 && (
                        <p><strong>Cast:</strong> {movie.actors.join(', ')}</p>
                    )}
                    {movie.genre && <p><strong>Genre:</strong> {movie.genre}</p>}
                    {movie.imdbRating && <p><strong>Rating:</strong> ⭐ {movie.imdbRating}/10</p>}
                </div>
            </div>
            
            {movie.plot && (
                <div className="movie-plot">
                    <h3>Synopsis</h3>
                    <p>{movie.plot}</p>
                </div>
            )}
            
            <div className="movie-locations">
                <h3>Filming Locations</h3>
                <p className="location-hint">Click on a location to see it on the map</p>
                <ul className="locations-list">
                    {movie.locations.map((location, index) => (
                        <li 
                            key={index}
                            onClick={() => onLocationSelect && onLocationSelect(location)}
                            className="location-item"
                        >
                            📍 {location}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};