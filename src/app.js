import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Static assets
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount main router
app.use(routes);

// 404 handler (for both API and views)
app.use((req, res) => {
  // prefer HTML by default
  res.status(404);
  if (req.accepts('html')) {
    res.render('error', { message: 'Not Found', error: 'Page not found' });
  } else {
    res.json({ success: false, error: 'Not Found' });
  }
});

// start server when not testing
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
