const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: {type: Array, default: []},
  directions: {type: String, default: ''},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Add `createdAt` and `updatedAt` fields
recipeSchema.set('timestamps', true);

recipeSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

recipeSchema.methods.serialize = function() {
  return {
    title: this.title || '',
    ingredients: this.ingredients || '',
    directions: this.directions || '',
    userId: this.userId ||'',
    id:this.id|| ''
  };
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = {Recipe};
