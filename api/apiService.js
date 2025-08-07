
import { ENDPOINTS } from './api';
import { fetchFromAPI } from './fetchFromAPI';

// Fetch introduction chapters with deep populate
export async function getIntroductionChaptersDeep(locale = 'en') {
  return await fetchFromAPI(ENDPOINTS.getIntroductionChaptersDeep(locale));
}

// Fetch all main chapters with their storyboards and tags
export async function getAllMainChapters(locale = 'en') {
  return await fetchFromAPI(ENDPOINTS.getAllMainChapters(locale));
}

// Fetch events with points and media details
export async function getEventsDeep(locale = 'el') {
  return await fetchFromAPI(ENDPOINTS.getEventsDeep(locale));
}

