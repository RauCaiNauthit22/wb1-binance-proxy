const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Cấu hình CORS
app.use(cors({ origin: '*' }));

// Parse JSON body
app.use(express.json());

// Route kiểm tra server
app.get('/', (req, res) => {
  console.log('Received request to root endpoint');
  res.send('✅ WB1 Proxy Server is Running!');
});

// Route proxy Binance
app.all('/api/*', async (req, res) => {
  try {
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://api.binance.com';
    const binanceUrl = `${BINANCE_API_URL}${req.originalUrl.replace('/api', '')}`;
    
    console.log(`[${req.method}] Proxying to: ${binanceUrl}`);
    
    // Retry logic
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    const retryDelay = 1000; // 1 giây giữa các lần thử
    while (attempts < maxAttempts) {
      try {
        response = await axios({
          method: req.method,
          url: binanceUrl,
          data: req.body,
          headers: {
            'User-Agent': 'WB1-Proxy/1.0.0'
          },
          timeout: 3000 // Timeout 3 giây để phản hồi nhanh hơn
        });
        break;
      } catch (err) {
        attempts++;
        if (attempts === maxAttempts) {
          throw err;
        }
        console.log(`Retrying (${attempts}/${maxAttempts}) for ${binanceUrl}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    console.log(`Successfully proxied to ${binanceUrl}`);
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

// Xử lý lỗi không bắt được
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    status: 500,
    error: 'Server error',
    message: err.message
  });
});

// Lắng nghe trên cổng và host do Railway yêu cầu
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`WB1 Proxy running on ${HOST}:${PORT}`);
});

// Xử lý lỗi khi server khởi động
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
