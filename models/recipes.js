const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: {type: Array, default: []},
  directions: {type: String, default: ''},
  tags: {type: Array, default: []},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

recipeSchema.set('timestamps', true);

recipeSchema.set('toObject', {
  virtuals: true,     
  versionKey: false, 
  transform: (doc, ret) => {
    delete ret._id; 
  }
});

recipeSchema.methods.serialize = function() {
  return {
    title: this.title || '',
    ingredients: this.ingredients || '',
    directions: this.directions || '',
    userId: this.userId ||'',
    id:this.id|| '',
    tags:this.tags||''
  };
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = {Recipe};
