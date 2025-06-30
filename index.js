const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Cấu hình CORS để cho phép tất cả origin (có thể tùy chỉnh nếu cần)
app.use(cors({ origin: '*' }));

// Middleware để parse JSON body (nếu cần cho các phương thức POST)
app.use(express.json());

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.send('✅ WB1 Proxy Server is Running!');
});

// Route proxy Binance
app.all('/api/*', async (req, res) => {
  try {
    // Lấy URL gốc của Binance từ biến môi trường hoặc mặc định
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://api.binance.com';
    const binanceUrl = `${BINANCE_API_URL}${req.originalUrl.replace('/api', '')}`;
    
    // Log yêu cầu để debug
    console.log(`[${req.method}] Proxying to: ${binanceUrl}`);
    
    // Gửi yêu cầu tới Binance với header User-Agent
    const response = await axios({
      method: req.method,
      url: binanceUrl,
      data: req.body,
      headers: {
        'User-Agent': 'WB1-Proxy/1.0.0',
        ...req.headers,
        host: 'api.binance.com' // Đảm bảo header host khớp với Binance
      }
    });
    
    // Trả về dữ liệu từ Binance
    res.json(response.data);
  } catch (err) {
    // Log lỗi để debug
    console.error(`Error proxying to ${binanceUrl}:`, err.message);
    
    // Trả về lỗi chi tiết
    const status = err.response?.status || 500;
    const errorData = err.response?.data || { error: 'Proxy error', message: err.message };
    res.status(status).json({
      status,
      error: errorData,
      message: `Failed to proxy request to ${binanceUrl}`
    });
  }
});

// Lắng nghe trên cổng do Railway cung cấp hoặc mặc định 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WB1 Proxy running on port ${PORT}`);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WB1 Proxy running on port ${PORT}`);
});
