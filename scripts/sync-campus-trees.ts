/**
 * Upserts the campus tree inventory defined in src/server/seed.ts into the
 * active database (MongoDB when MONGODB_URI is set, otherwise .data/*.json).
 *
 * The regular seeder only runs on an empty collection, so this script is used
 * to refresh already-seeded environments after the tree records change.
 *
 * Run with: npm run sync:trees
 */
import 'dotenv/config';
import { closeDatabase, initDatabase } from '../src/server/db.js';
import { campusTreesCollection } from '../src/server/models.js';
import { campusTrees } from '../src/data/campusTrees.js';

async function main() {
  const { type } = await initDatabase();
  console.log(`[sync:trees] Using ${type === 'mongodb' ? 'MongoDB' : 'local .data file engine'}`);

  for (const tree of campusTrees) {
    const existing = await campusTreesCollection.findById(tree.id);
    if (existing) {
      await campusTreesCollection.update(tree.id, tree);
      console.log(`[sync:trees] Updated  ${tree.tagNumber}  ${tree.speciesCommon}`);
    } else {
      await campusTreesCollection.insert(tree);
      console.log(`[sync:trees] Inserted ${tree.tagNumber}  ${tree.speciesCommon}`);
    }
  }

  const total = await campusTreesCollection.count();
  console.log(`[sync:trees] Done. ${total} tree record(s) in the collection.`);
}

main()
  .catch((err) => {
    console.error('[sync:trees] Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
