import axios from 'axios';
import { SERVER_IP } from './api';


export async function fetchFromAPI(endpoint) {
  const query = SERVER_IP + endpoint;
  const response = await axios.get(query);
  return response.data.data;
}