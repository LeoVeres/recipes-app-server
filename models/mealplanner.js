const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: {type: Array, default: []},
  directions: {type: String, default: ''},
  meal: {type: String, default: ''},
  day: {type: String, default: ''},
  tags: {type: Array, default: []},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

planSchema.set('timestamps', true);

planSchema.set('toObject', {
  virtuals: true,     
  versionKey: false, 
  transform: (doc, ret) => {
    delete ret._id; 
  }
});

planSchema.methods.serialize = function() {
  return {
    title: this.title || '',
    ingredients: this.ingredients || '',
    directions: this.directions || '',
    userId: this.userId ||'',
    id:this.id|| '',
    meal:this.tags||'',
    day:this.tags||'',
    tags:this.tags||'',
  };
};

const Plan = mongoose.model('Plan', planSchema);

module.exports = {Plan};