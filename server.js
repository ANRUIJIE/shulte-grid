const express = require('express');
const QRCode = require('qrcode');
const os = require('os');
const path = require('path');

const PORT = 3456;
const app = express();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/qrcode', async (req, res) => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    res.json({ url, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}`;
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     舒尔特方格 · 本地服务已启动      ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  本机访问: http://localhost:${PORT}     ║`);
  console.log(`  ║  手机扫码: ${url.padEnd(24)}║`);
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  请确保手机和电脑在同一 WiFi 网络下   ║');
  console.log('  ║  用微信扫描页面上的二维码即可进入     ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
