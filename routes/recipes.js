const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Recipe} = require('../models/recipes');


const router = express.Router();
const jsonParser = bodyParser.json();


/* ========== GET ALL ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  const userId = req.user.id;

  let filter = { userId };

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'ingredients': re }];
  }



  Recipe.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Recipe.findOne({ _id: id, userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST ========== */
router.post('/',jsonParser, (req, res, next) => {
  const { title, ingredients, directions, tags} = req.body;
  const userId = req.user.id;
  const newRecipe = { title, ingredients, userId, directions, tags };

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Recipe.create(newRecipe)
    .then(result => {
      return res.status(201).json(result.serialize());
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT ========== */
router.put('/:id', jsonParser, (req, res, next) => {
  console.log(req.body);
  const { id } = req.params;
  const { title, ingredients, directions, tags } = req.body;
  const userId = req.user.id;
  const updateRecipe = { title, ingredients, userId, directions,tags };
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  Recipe.findByIdAndUpdate(id, updateRecipe, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Recipe.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = {router};