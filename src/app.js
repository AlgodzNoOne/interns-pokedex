import express from 'express';
import dotenv from 'dotenv';
import * as pokemonService from './services/pokemonService.js';

dotenv.config();

const app = express();
app.use(express.json());

// helper for writing error responses
function handleError(res, err) {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
}

app.get('/api/pokemon', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || undefined;
  try {
    const data = await pokemonService.getAllPokemon(page, limit);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/pokemon/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const data = await pokemonService.searchPokemon(q);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/pokemon/:nameOrId', async (req, res) => {
  const { nameOrId } = req.params;
  try {
    const data = await pokemonService.getPokemonDetails(nameOrId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/types', async (req, res) => {
  try {
    const data = await pokemonService.getPokemonTypes();
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/types/:type', async (req, res) => {
  const { type } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || undefined;
  try {
    const data = await pokemonService.getPokemonByType(type, page, limit);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

// start server when not under test
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
