import * as repo from '../repositories/pokemonRepository.js';

const DEFAULT_PAGE_LIMIT = Number(process.env.DEFAULT_PAGE_LIMIT) || 20;

function capitalize(str = '') {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function findEnglish(entryArray) {
  if (!Array.isArray(entryArray)) return undefined;
  return entryArray.find((e) => e?.language?.name === 'en');
}

export async function getPokemonDetails(nameOrId) {
  const data = await repo.getPokemonByNameOrId(nameOrId);
  if (!data) return null;

  let species = null;
  try {
    species = await repo.getPokemonSpecies(nameOrId);
  } catch (e) {
    // ignore; default values will be applied below
  }

  const color = species?.color?.name ?? 'gray';
  const genusEntry = findEnglish(species?.genera);
  const genus = genusEntry ? genusEntry.genus : '';

  const flavorEntry = findEnglish(species?.flavor_text_entries);
  const description = flavorEntry
    ? flavorEntry.flavor_text.replace(/\s+/g, ' ')
    : 'No description available.';

  return {
    id: data.id,
    name: data.name,
    displayName: capitalize(data.name),
    types: data.types.map((t) => t.type.name),
    height: data.height / 10,
    weight: data.weight / 10,
    abilities: data.abilities,
    stats: data.stats,
    color,
    genus,
    description
  };
}

export async function getAllPokemon(page = 1, limit = DEFAULT_PAGE_LIMIT) {
  const offset = (page - 1) * limit;
  const { count, results } = await repo.getAllPokemon(limit, offset);
  const totalPages = Math.ceil(count / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const pokemonList = [];
  for (const r of results) {
    const detail = await getPokemonDetails(r.name);
    if (detail) pokemonList.push(detail);
  }

  return {
    pokemon: pokemonList,
    totalCount: count,
    currentPage: page,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
}

export async function searchPokemon(query) {
  if (!query) {
    return { pokemon: [], totalCount: 0 };
  }

  const exact = await repo.getPokemonByNameOrId(query);
  if (exact) {
    const details = await getPokemonDetails(query);
    return { pokemon: [details], totalCount: 1 };
  }

  const results = await repo.searchPokemon(query);

  const pokemonList = [];
  for (const r of results.results) {
    const detail = await getPokemonDetails(r.name);
    if (detail) pokemonList.push(detail);
  }

  return { pokemon: pokemonList, totalCount: results.count };
}

export async function getPokemonTypes() {
  const types = await repo.getPokemonTypes();
  return types
    .filter((t) => t.name !== 'unknown' && t.name !== 'shadow')
    .map((t) => ({ name: t.name, displayName: capitalize(t.name) }));
}

export async function getPokemonByType(type, page = 1, limit = DEFAULT_PAGE_LIMIT) {
  const list = await repo.getPokemonByType(type);
  if (!Array.isArray(list)) {
    return null;
  }

  const totalCount = list.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const pageItems = list.slice(offset, offset + limit);

  const pokemonList = [];
  for (const item of pageItems) {
    const detail = await getPokemonDetails(item.name);
    if (detail) pokemonList.push(detail);
  }

  return {
    type,
    pokemon: pokemonList,
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
