import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 NSQTech Dashboard API`);
  console.log(`   ➜  Local:   http://localhost:${PORT}`);
  console.log(`   ➜  Health:  http://localhost:${PORT}/api/health`);
  console.log(`   ➜  Env:     ${process.env.NODE_ENV || 'development'}\n`);
});
