export interface Movie {
  title: string;
  year: number;
  locations: string[];
  director?: string;
  actors?: string[];
  poster?: string;
  plot?: string;
  imdbRating?: string;
  genre?: string;
}

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  description: string;
  image?: string;
  wikipediaExtract?: string;
  type?: 'city' | 'country';
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
