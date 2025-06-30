const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Proxy endpoint
app.get('/api/*', async (req, res) => {
  const binancePath = req.originalUrl.replace('/api', '');
  const binanceUrl = `https://api.binance.com${binancePath}`;
  
  try {
    const response = await axios.get(binanceUrl);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).send(err.response?.data || 'Proxy error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ WB1 Proxy Server is Running on port ${PORT}`);
});
