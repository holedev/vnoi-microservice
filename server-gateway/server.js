import { app, PORT } from './index.js';
import exitHook from 'async-exit-hook';
import os from 'os';

app.listen(PORT, () => {
  console.log(`---> Gateway is running on port ${PORT} <---`);
  console.log('---> Server Info <---');
  console.log(`OS: ${os.platform()}`);
  console.log(`Arch: ${os.arch()}`);
  console.log(`CPUs: ${os.cpus().length}`);
  console.log(`Memory: ${os.totalmem() / 1024 / 1024 / 1024} GB`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV.toUpperCase()}`);
  console.log(`Port: ${PORT}`);
  console.log('---> ----------- <---');
});

exitHook(() => {
  console.log(`---> Server is shutting down ... <---`);
});
