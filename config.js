'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL:
        process.env.DATABASE_URL || 'mongodb://leoveres:dev123@ds125001.mlab.com:25001/leo-recipe-app-database',
  TEST_DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        'mongodb://leoveres:dev123@ds125021.mlab.com:25021/leo-recipe-app-database-test',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/recipes-app',
  JWT_SECRET :process.env.JWT_SECRET,
  JWT_EXPIRY :process.env.JWT_EXPIRY || '7d',
};
