'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../index');
const { Recipe } = require('../models/recipes');
const { User } = require('../models/users');
const { JWT_SECRET, TEST_DATABASE_URL, PORT } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipe book tests', function () {
  const title = 'exampleTitle';
  const ingredients = ['exampleingredient1','exampleingredient2'];
  const directions = 'exampleDirections';
  const tags = ['exampletag1','exampletag2'];
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  let newUser;
  const user = { username, password};
  const token = jwt.sign({ user }, JWT_SECRET, { subject: username });


  before(function () {
    return runServer(TEST_DATABASE_URL, PORT);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {

    return User.hashPassword(password)
      .then(password =>{
        return User.create({
          username,
          password,
          firstName,
          lastName        
        });
      })
      .then((_user)=>{
        newUser=_user;
        console.log(newUser.id +'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        return Recipe.create({
          title,
          ingredients,
          directions,
          tags,
          userId: _user.id
        });
      });

  });


  afterEach(function () {
    return Recipe.remove({}).then(()=>User.remove({}));
  });

  describe('GET/api/recipes', function () {
    console.log(token);
    it('should return recipes', function () {
      return chai.request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          return Recipe.find();
        });
  
    });

  });

  describe('POST /api/recipes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {title, userId:newUser.id};
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
          expect(res.body).to.have.keys('title', 'ingredients', 'directions', 'tags');
          return Recipe.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.title).to.equal(data.title);
          expect(res.body.tags).to.equal(data.tags);
          expect(res.body.ingredients).to.equal(data.ingredients);
          expect(res.body.ingredients.length).to.equal(data.ingredients.length);
          expect(res.body.directions).to.equal(data.directions);
        });
    });
    
    // it('should return an error when posting an object with a missing "title" field', function () {
    //   const newItem = {
    //     'ingredients': [
    //       'ground beef',
    //       'eggs',
    //       'milk',
    //       'bread'
    //     ],
    //     'directions': 'make it. eat it',
    //     'tags': ['Dinner', 'American'],
    //     'userId': '123'
    //   };

    //   return chai.request(app)
    //     .post('/api/recipes')
    //     .set('Authorization', `Bearer ${token}`)
    //     .send(newItem)
    //     .catch(err => err.response)
    //     .then(res => {
    //       expect(res).to.have.status(422);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.a('object');
    //       expect(res.body.message).to.equal('Missing field');
    //     });
    // });
  });
  describe('DELETE  /api/recipes/:id', function () {

    it('should delete an item by id', function () {
      let data;
      return Recipe.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/recipes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

  });
});