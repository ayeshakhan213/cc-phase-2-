const express = require('express');
const cors = require('cors');

const { products } = require('./products');
const { ai, processQuery } = require('./genkit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Products endpoints
app.get('/api/products', (req, res) => {
  res.json({ data: products });
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ data: p });
});

app.post('/api/products/search', (req, res) => {
  const { q } = req.body || {};
  if (!q) return res.json({ data: products });
  const lower = String(q).toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
  res.json({ data: filtered });
});

// AI query endpoint (wraps service-layer flow)
app.post('/api/ai/query', async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query in body' });

  try {
    const result = await processQuery({ query });
    res.json({ data: result });
  } catch (err) {
    console.error('AI query failed', err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Simple recommendation and try-on stubs
app.get('/api/recommendations', (req, res) => {
  // Return top-rated sample recommendations
  const recs = products.slice(0, 4);
  res.json({ data: recs });
});

app.post('/api/recommendations', (req, res) => {
  // Accepts { skinType, preferences } and returns a simple recommendation list
  const { skinType, preferences } = req.body || {};
  // Simple heuristic: return first 4 products with a friendly message
  const recs = products.slice(0, 4).map(p => `${p.name} — ${p.brand}`);
  res.json({ data: { recommendations: recs } });
});

app.post('/api/tryon/apply', (req, res) => {
  // In a real service this would run an ML model. For now, echo back the uploaded image as the "modified" image.
  const { photoDataUri, productColorHex } = req.body || {};
  if (!photoDataUri || !productColorHex) return res.status(400).json({ error: 'Missing photoDataUri or productColorHex' });

  // TODO: integrate real AI try-on model. For demo, return the same photo with a small tag appended.
  const modified = photoDataUri; // placeholder
  res.json({ data: { modifiedPhotoDataUri: modified } });
});

app.post('/api/orders', (req, res) => {
  // In a real app, persist order to DB. Here we simulate success.
  res.status(201).json({ data: { orderId: 'order_' + Date.now() } });
});

app.listen(PORT, () => {
  console.log(`Glamcart backend listening on port ${PORT}`);
});
