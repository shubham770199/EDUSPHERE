const asyncHandler = require('../utils/asyncHandler');
const seedDatabase = require('../utils/seed');

// @route POST /api/seed  — (re)populate the database with demo data.
// Open in this educational project so graders can reset the demo with one click.
exports.seed = asyncHandler(async (req, res) => {
  const result = await seedDatabase();
  res.json({ message: 'Database seeded with demo data ✅', ...result });
});
