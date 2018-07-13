'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../index');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const {Recipe} = require('../models/recipes');
const {Plan} = require('../models/mealplanner');
const {List} = require('../models/shoppinglist');
const {User} = require('../models/users');

const seedRecipes = require('../db/seed/recipes');
const seedMealplanner = require('../db/seed/mealplanner');
const seedShoppinglist = require('../db/seed/shoppinglist');
const seedUsers = require('../db/seed/users');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Recipes API', function () {

  let user = {};
  let token;
  before(function () {
    return mongoose.connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),
      Recipe.insertMany(seedRecipes),
      Plan.insertMany(seedMealplanner),
      Plan.createIndexes(),
      List.insertMany(seedShoppinglist),
      List.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/recipes', function () {
    it('should return the correct number of recipes', function () {
      return Promise.all([
        Recipe.find({ userId: user.id }),
        chai.request(app)
          .get('/api/recipes')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Recipe.find({ userId: user.id }).sort({ updatedAt: 'desc' }),
        chai.request(app)
          .get('/api/recipes')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('createdAt', 'directions', 'id', 'ingredients', 'tags', 'title','updatedAt', 'userId');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
          });
        });
    });

  });

  describe('GET /api/recipes/:id', function () {
    it('should return correct recipe', function () {
      let data;

      return Recipe.findOne({ userId: user.id })
        .then(_data => {
          data = _data;

          return chai.request(app)
            .get(`/api/recipes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('createdAt', 'directions', 'id', 'ingredients', 'tags', 'title','updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/recipes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .catch(err => {
          // expect(err).to.contain('The `id` is not valid');
          expect(err).to.have.status(400);
        });
    });
    it('should respond with a 404 for an id that does not exist', function () {
      return chai.request(app)
        .get('/api/notes/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .catch(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/recipes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        title:'toast',
        ingredients:  ['flour', 'sugar'],
        directions: 'mix and bake',
        tags: ['dessert','lunch']
      };
      let res;

      return chai.request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('directions', 'id', 'ingredients', 'tags', 'title', 'userId');
          return Recipe.findOne({ _id: res.body.id, userId: user.id });
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
        });
    });

    it('should return an error when missing "title" field', function () {
      const newItem = {
        ingredients:  ['flour', 'sugar'],
        directions: 'mix and bake',
        tags: ['dessert','lunch']
      };
      return chai.request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .catch(res => {
          expect(res).to.have.status(400);          
          // expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('PUT /api/recipes/:id', function () {

    it('should update the recipe when provided valid data', function () {
      const updateItem = {
        title:'toast',
        ingredients:  ['flour', 'sugar'],
        directions: 'mix and bake',
        tags: ['dessert','lunch']
      };
      let data;
      return Recipe.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/recipes/${data.id}`)
            .send(updateItem)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('createdAt', 'directions', 'id', 'ingredients', 'tags', 'title','updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateItem.title);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      const updateItem = {
        title:'toast',
        ingredients:  ['flour', 'sugar'],
        directions: 'mix and bake',
        tags: ['dessert','lunch']
      };
      return chai.request(app)
        .put('/api/recipes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .catch(res => {
          expect(res).to.have.status(400);
          // expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

    it('should return an error when "title" is an empty string', function () {
      const updateItem = {
        title: '',
        ingredients:  ['flour', 'sugar'],
        directions: 'mix and bake',
        tags: ['dessert','lunch']
      };
      let data;
      return Recipe.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/recipes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .catch(res => {
          expect(res).to.have.status(400);          
          // expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('DELETE /api/recipes/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Recipe.findOne({ userId: user.id })
        .then(_data => {
          data = _data;

          return chai.request(app)
            .delete(`/api/recipes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Recipe.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .delete('/api/recipes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .catch(res => {
          expect(res).to.have.status(400);
          // expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });

});
