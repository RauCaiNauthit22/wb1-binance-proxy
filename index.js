const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Cấu hình CORS cho phép tất cả origin
app.use(cors({ origin: '*' }));

// Middleware để parse JSON body
app.use(express.json());

// Route kiểm tra server
app.get('/', (req, res) => {
  res.send('✅ WB1 Proxy Server is Running!');
});

// Route proxy Binance
app.all('/api/*', async (req, res) => {
  try {
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://api.binance.com';
    const binanceUrl = `${BINANCE_API_URL}${req.originalUrl.replace('/api', '')}`;
    
    console.log(`[${req.method}] Proxying to: ${binanceUrl}`);
    
    // Gửi yêu cầu tới Binance với timeout và header tối thiểu
    const response = await axios({
      method: req.method,
      url: binanceUrl,
      data: req.body,
      headers: {
        'User-Agent': 'WB1-Proxy/1.0.0'
      },
      timeout: 5000 // Timeout 5 giây
    });
    
    res.json(response.data);
  } catch (err) {
    console.error(`Error proxying to ${binanceUrl}:`, err.message);
    const status = err.response?.status || 500;
    const errorData = err.response?.data || { error: 'Proxy error', message: err.message };
    res.status(status).json({
      status,
      error: errorData,
      message: `Failed to proxy request to ${binanceUrl}`
    });
  }
});

// Lắng nghe trên cổng do Railway cung cấp
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WB1 Proxy running on port ${PORT}`);
});
