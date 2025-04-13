import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/SearchBar.css';

// Lista de películas populares para sugerir
const POPULAR_MOVIES = [
    'Inception', 'The Dark Knight', 'Forrest Gump', 
    'The Lord of the Rings', 'Harry Potter', 'Casablanca',
    'Star Wars', 'Avatar', 'Mission Impossible', 'Jurassic Park'
];

interface SearchBarProps {
    onSearch: (query: string) => void;
    loading: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        // Filter suggestions based on current query
        if (query.length > 1) {
            const filtered = POPULAR_MOVIES.filter(movie => 
                movie.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };

    const handleRandomMovie = () => {
        const randomIndex = Math.floor(Math.random() * POPULAR_MOVIES.length);
        const randomMovie = POPULAR_MOVIES[randomIndex];
        setQuery(randomMovie);
        onSearch(randomMovie);
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-bar">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a movie..."
                    disabled={loading}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => query.length > 1 && setSuggestions(POPULAR_MOVIES.filter(movie => 
                        movie.toLowerCase().includes(query.toLowerCase())
                    ))}
                />
                <button type="submit" disabled={loading} className="search-button">
                    {loading ? 'Searching...' : <FaSearch />}
                </button>
                <button 
                    type="button" 
                    onClick={handleRandomMovie} 
                    disabled={loading}
                    className="random-button"
                >
                    Random Movie
                </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};