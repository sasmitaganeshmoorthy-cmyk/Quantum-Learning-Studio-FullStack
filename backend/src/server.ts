import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { createApp } = await import('./app');
const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  console.log(`Quantum Learning API running at http://localhost:${port}`);
});
