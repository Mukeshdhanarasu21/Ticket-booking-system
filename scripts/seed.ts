import { dbStore } from '../server/repositories/db';

async function seed() {
  console.log('🌱 Seeding database store with default events and seat grids...');
  dbStore.seedDefaults();
  console.log(`✅ Seed complete! Events count: ${dbStore.events.size}, Seats count: ${dbStore.seats.size}`);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
