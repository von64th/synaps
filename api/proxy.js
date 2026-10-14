// api/proxy.js - Node.js Serverless Proxy deployed on Vercel
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS so your frontend can communicate with the proxy
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing target URL parameter' });
  }

  try {
    // Decode the URL (it will be sent encoded from the frontend to hide it from firewalls)
    const targetUrl = decodeURIComponent(url);

    // EXPLOIT: The Vercel cloud server fetches the page, completely hiding your local network IP
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const contentType = response.headers.get('content-type');
    let body = await response.text();

    // EXPLOIT: Link Rewriting Engine
    // If the proxy returns standard html links, clicking them would break out of the proxy.
    // We rewrite links to route back through our serverless proxy endpoint.
    if (contentType && contentType.includes('text/html')) {
      const proxyDomain = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      
      // Basic regex replacement to capture href="http..." and route them via our proxy
      body = body.replace(/href="([^"]+)"/g, (match, p1) => {
        if (p1.startsWith('http')) {
          return `href="${protocol}://${proxyDomain}/api/proxy?url=${encodeURIComponent(p1)}"`;
        }
        return match;
      });
    }

    res.setHeader('Content-Type', contentType || 'text/html');
    return res.status(response.status).send(body);

  } catch (error) {
    return res.status(500).json({ error: 'Failed fetching the requested site through cloud proxy', details: error.message });
  }
}
