const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const Recipe = require('../models/recipes');
const User = require('../models/users');

const seedRecipes = require('../seed-db/recipes');
const seedUsers = require('../seed-db/users');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([

      Recipe.insertMany(seedRecipes),
      User.insertMany(seedUsers)
    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });