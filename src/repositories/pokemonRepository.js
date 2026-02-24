import axios from 'axios';

const BASE_URL = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
const DEFAULT_PAGE_LIMIT = Number(process.env.DEFAULT_PAGE_LIMIT) || 20;
const MAX_SEARCH_LIMIT = Number(process.env.MAX_SEARCH_LIMIT) || 1000;

export async function getAllPokemon(limit = DEFAULT_PAGE_LIMIT, offset = 0) {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (err) {
    throw new Error('Failed to fetch Pokemon list');
  }
}

export async function getPokemonByNameOrId(nameOrId) {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${nameOrId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch Pokemon');
  }
}

export async function getPokemonSpecies(nameOrId) {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon-species/${nameOrId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function searchPokemon(query) {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit: MAX_SEARCH_LIMIT }
    });

    const results = response.data.results.filter((p) => p.name.includes(query));
    return { count: results.length, results };
  } catch (err) {
    throw new Error('Failed to search Pokemon');
  }
}

export async function getPokemonTypes() {
  try {
    const response = await axios.get(`${BASE_URL}/type`);
    return response.data.results;
  } catch (err) {
    throw new Error('Failed to fetch Pokemon types');
  }
}

export async function getPokemonByType(type) {
  try {
    const response = await axios.get(`${BASE_URL}/type/${type}`);
    return response.data.pokemon.map((item) => item.pokemon);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch Pokemon by type');
  }
}
