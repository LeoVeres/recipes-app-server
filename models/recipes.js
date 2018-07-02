const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: String,
  directions: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Add `createdAt` and `updatedAt` fields
recipeSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
recipeSchema.set('toObject', {
  virtuals: true,    
  versionKey: false,  
  transform: (doc, ret) => {
    delete ret._id; 
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);