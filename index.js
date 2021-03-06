'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const {router: recipesRouter} = require('./routes/recipes');
const {router: shoppinglistRouter} = require('./routes/shoppinglist');
const {router: planRouter} = require('./routes/mealplanner');
const {router: usersRouter} = require('./routes/users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./passport/index');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL} = require('./config');

const app = express();


// Logging
app.use(morgan('common'));

// Create a static webserver
app.use(express.static('public'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

// Utilize the given `strategy`
passport.use(localStrategy);
passport.use(jwtStrategy);

// Protect endpoints using JWT Strategy
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

// Mount routers
app.use('/api/recipes/', jwtAuth, recipesRouter);
app.use('/api/shoppinglist/', jwtAuth, shoppinglistRouter);
app.use('/api/mealplanner/', jwtAuth, planRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);



app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };