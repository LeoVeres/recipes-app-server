'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const {Recipe} = require('../models/recipes');
const {Plan} = require('../models/mealplanner');
const {List} = require('../models/shoppinglist');
const {User} = require('../models/users');

const seedRecipes = require('../db/seed/recipes');
const seedMealplanner = require('../db/seed/mealplanner');
const seedShoppinglist = require('../db/seed/shoppinglist');
const seedUsers = require('../db/seed/users');


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

      Plan.insertMany(seedMealplanner),
      Plan.createIndexes(),

      List.insertMany(seedShoppinglist),
      List.createIndexes(),

      User.insertMany(seedUsers),
      User.createIndexes(),
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
