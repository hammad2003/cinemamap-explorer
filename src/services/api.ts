import axios, { AxiosError } from 'axios';
import { Movie, LocationData } from '../types/types';

const OMDb_API_KEY = 'c95ba846'; // Clau d'accés de l'API d'OMDb

/**
 * Configuració d'axios amb mecanisme de retry.
 */
interface RetryConfig {
  retry: number;
  retryDelay?: number;
  lastError?: Error;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
  }
}

/**
 * Crea una instància d'axios per una URL base concreta i amb configuració per fer retry
 */
const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({ baseURL });

  // Interceptor per gestionar el retry amb backoff exponencial
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as any & RetryConfig;
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    config.lastError = error;
    config.retry -= 1;

    const delay = config.retryDelay || Math.min(1000 * (3 - config.retry), 3000);

    if (config.retry === 0) {
      return Promise.reject(new Error(`Failed after retries: ${config.lastError.message}`));
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return instance(config);
  });

  return instance;
};

// Instàncies específiques per a cadascuna de les API
const omdbAPI = createAxiosInstance('https://www.omdbapi.com');
const nominatimAPI = createAxiosInstance('https://nominatim.openstreetmap.org');
const wikipediaAPI = createAxiosInstance('https://en.wikipedia.org/api/rest_v1');

/**
 * Funció genèrica de retry amb backoff exponencial.
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i === retries - 1) break;
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
    }
  }
  throw lastError;
};

/**
 * Funció per buscar informació d'una pel·lícula a l'API d'OMDb.
 */
export const fetchMovieData = async (title: string): Promise<Movie> => {
  const searchMovie = async () => {
    try {
      return await omdbAPI.get('', {
        params: {
          apikey: OMDb_API_KEY,
          t: title
        },
        retry: 3,
        retryDelay: 1000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconegut';
      throw new Error(`Movie search failed: ${errorMessage}`);
    }
  };

  try {
    const searchResponse = await retryWithBackoff(searchMovie);

    if (searchResponse.data.Response === 'False') {
      throw new Error(searchResponse.data.Error || 'Pel·lícula no trobada');
    }

    const movieData = searchResponse.data;

    // Extreure les localitzacions; inicialment es pot extreure des del camp 'Country'
    let locations: string[] = [];
    if (movieData.Country && typeof movieData.Country === 'string') {
      locations = movieData.Country.split(/\s*,\s*/).filter(Boolean);
    }

    // Afegir locations del camp "Location" si existeix
    if (movieData.Location && typeof movieData.Location === 'string') {
      const locationItems = movieData.Location.split(/\s*,\s*/).filter(Boolean);
      locations = [...new Set([...locations, ...locationItems])];
    }

    // Afegir localitzacions addicionals per algunes pel·lícules conegudes
    const knownMoviesLocations: Record<string, string[]> = {
      'inception': ['Paris', 'Tokyo', 'Los Angeles', 'Tangier', 'London'],
      'the dark knight': ['Chicago', 'Hong Kong', 'London'],
      'forrest gump': ['Savannah', 'Los Angeles', 'Washington D.C.', 'Vietnam'],
      'the lord of the rings': ['New Zealand', 'Wellington', 'Matamata'],
      'harry potter': ['London', 'Scotland', 'Oxford', 'Alnwick Castle'],
      'casablanca': ['Casablanca', 'Hollywood'],
      'star wars': ['Tunisia', 'Norway', 'Italy', 'Guatemala', 'Death Valley'],
      'avatar': ['New Zealand', 'Hawaii'],
      'mission impossible': ['Dubai', 'Prague', 'London', 'Paris'],
      'jurassic park': ['Hawaii', 'Dominican Republic'],
      'titanic': ['Halifax', 'Atlantic Ocean', 'Belfast'],
      'the godfather': ['New York', 'Sicily', 'Los Angeles'],
      'pulp fiction': ['Los Angeles', 'Hollywood'],
      'schindler\'s list': ['Krakow', 'Poland', 'Israel'],
      'gladiator': ['Rome', 'Morocco', 'Malta', 'England'],
      'the matrix': ['Sydney', 'Australia'],
      'interstellar': ['Iceland', 'Canada', 'Los Angeles']
    };

    const lowerTitle = movieData.Title.toLowerCase();
    for (const [key, locs] of Object.entries(knownMoviesLocations)) {
      if (lowerTitle.includes(key)) {
        locations = [...new Set([...locations, ...locs])];
        break;
      }
    }

    // Si no hi ha localitzacions, afegim almenys una
    if (locations.length === 0) {
      locations = ['Hollywood'];
    }

    return {
      title: movieData.Title,
      year: parseInt(movieData.Year) || 0,
      director: movieData.Director,
      actors: movieData.Actors?.split(/\s*,\s*/).filter(Boolean) || [],
      locations,
      poster: movieData.Poster !== 'N/A' ? movieData.Poster : undefined,
      plot: movieData.Plot,
      imdbRating: movieData.imdbRating,
      genre: movieData.Genre
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconegut';
    throw new Error(`Movie fetch failed: ${errorMessage}`);
  }
};

/**
 * Funció per buscar la informació d'una localització.
 * Utilitza l'API de Nominatim per obtenir coordenades i Wikipedia per obtenir una descripció.
 */
export const fetchLocationInfo = async (locationName: string): Promise<LocationData> => {
  // Funció per esperar amb retry
  const delayWithRetry = async (ms: number, retries: number = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, ms));
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }
  };

  // Cerca a Nominatim per a tipus 'city' i 'country'
  const searchNominatim = async (featureType: 'city' | 'country' | string) => {
    const config = {
      params: {
        format: 'json',
        q: locationName,
        featuretype: featureType,
        limit: 1
      },
      headers: { 'User-Agent': 'MovieLocationsExplorer/1.0' },
      retry: 3,
      retryDelay: 1000
    };

    return await nominatimAPI.get('/search', config);
  };

  try {
    // Primer intentem buscar com a ciutat
    let nominatimResponse = await retryWithBackoff(
      () => searchNominatim('city')
    );

    // Si no trobem res, busquem com a país
    if (nominatimResponse.data.length === 0) {
      await delayWithRetry(1000);
      nominatimResponse = await retryWithBackoff(
        () => searchNominatim('country')
      );
    }

    // Si encara no trobem res, busquem sense especificar el tipus
    if (nominatimResponse.data.length === 0) {
      await delayWithRetry(1000);
      nominatimResponse = await retryWithBackoff(
        () => searchNominatim('')
      );
    }

    if (nominatimResponse.data.length === 0) {
      throw new Error(`Location "${locationName}" not found`);
    }

    const firstResult = nominatimResponse.data[0];
    const { lat, lon, display_name } = firstResult;

    // Consulta a Wikipedia per obtenir més informació sobre la localització
    try {
      await delayWithRetry(1000);
      
      // Intentem primer amb el nom exacte de la localització
      let wikipediaResponse;
      try {
        wikipediaResponse = await retryWithBackoff(
          () => wikipediaAPI.get(`/page/summary/${encodeURIComponent(locationName)}`, {
            retry: 3,
            retryDelay: 1000
          })
        );
      } catch (error) {
        // Si falla amb el nom exacte, intentem amb la primera part del nom complet
        const simpleName = locationName.split(',')[0].trim();
        wikipediaResponse = await retryWithBackoff(
          () => wikipediaAPI.get(`/page/summary/${encodeURIComponent(simpleName)}`, {
            retry: 3,
            retryDelay: 1000
          })
        );
      }

      return {
        name: display_name,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        description: wikipediaResponse.data.extract || `Information about ${display_name}`,
        type: firstResult.type as 'city' | 'country',
        wikipediaExtract: wikipediaResponse.data.extract,
        image: wikipediaResponse.data.thumbnail?.source
      };
    } catch (wikiError) {
      // En cas que Wikipedia falli, retorna informació bàsica
      return {
        name: display_name,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        description: `Location: ${display_name}. This is one of the places related to the movie.`,
        type: firstResult.type as 'city' | 'country'
      };
    }
  } catch (error) {
    throw new Error(`Location fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};