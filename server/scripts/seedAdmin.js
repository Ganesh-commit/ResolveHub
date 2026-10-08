const seedDatabase = require('./seed');
module.exports = seedDatabase;
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
