const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.static(path.join(__dirname, 'public')));

// Proxy to Normies API — avoids CORS, hides origin
app.get('/api/normie/:id/:resource', (req, res) => {
  const { id, resource } = req.params;
  const normieId = parseInt(id);

  if (isNaN(normieId) || normieId < 0 || normieId > 9999) {
    return res.status(400).json({ error: 'Invalid Normie ID. Must be 0–9999.' });
  }

  const allowedResources = ['traits', 'pixels', 'image.svg', 'image.png', 'metadata'];
  if (!allowedResources.includes(resource)) {
    return res.status(400).json({ error: 'Invalid resource.' });
  }

  const url = `https://api.normies.art/normie/${normieId}/${resource}`;

  const request = https.get(url, (apiRes) => {
    res.status(apiRes.statusCode);
    res.set('Access-Control-Allow-Origin', '*');
    if (apiRes.headers['content-type']) {
      res.set('Content-Type', apiRes.headers['content-type']);
    }
    res.set('Cache-Control', 'public, max-age=3600'); // cache 1hr
    apiRes.pipe(res);
  });

  request.on('error', (err) => {
    console.error('API error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to fetch from Normies API' });
  });

  request.setTimeout(12000, () => {
    request.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'Request timeout' });
  });
});

app.listen(PORT, () => {
  console.log(`\n🎓 Normie High School Yearbook`);
  console.log(`   Running at http://localhost:${PORT}\n`);
});
