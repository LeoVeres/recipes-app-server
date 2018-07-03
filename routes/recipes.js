const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Recipe} = require('../models/recipes');

const router = express.Router();
const jsonParser = bodyParser.json();
/* ========== GET/READ ALL ITEMS ========== */
// router.get('/', (req, res, next) => {
//   const { searchTerm} = req.query;
//   const userId = req.user.id;

//   let filter = { userId };

//   if (searchTerm) {
//     const re = new RegExp(searchTerm, 'i');
//     filter.$or = [{ 'title': re }, { 'ingredients': re }];
//   }

//   Recipe.find(filter)
//     .sort({ updatedAt: 'desc' })
//     .then(results => {
//       res.json(results);
//     })
//     .catch(err => {
//       next(err);
//     });
// });

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/',jsonParser, (req, res, next) => {
  const { title, ingredients, directions} = req.body;
  const userId = req.user.id;
  const newRecipe = { title, ingredients, userId, directions };

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Recipe.create(newRecipe)
    .then(result => {
      return res.status(201).json(result.serialize());
      // res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, ingredients, directions } = req.body;
  const userId = req.user.id;
  const updateRecipe = { title, ingredients, userId, directions };

  /***** Never trust users - validate input *****/
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

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
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

router.get('/', (req, res) => {
  return Recipe.find()
    .then(recipes => res.json(recipes.map(recipes => recipes.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


module.exports = {router};