const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {List} = require('../models/shoppinglist');


const router = express.Router();
const jsonParser = bodyParser.json();


/* ========== GET ALL ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  let filter = { userId };

  List.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  List.findOne({ _id: id, userId })
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
  const {extra} = req.body;
  const userId = req.user.id;
  const newList = {extra, userId};

  List.create(newList)
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
  const {extra, checked} = req.body;
  const userId = req.user.id;
  const updateList = {extra, checked,userId};
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  List.findByIdAndUpdate(id, updateList, { new: true })
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

  List.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = {router};