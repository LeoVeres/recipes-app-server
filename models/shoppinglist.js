const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  extra: {type: String, default: ''},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

listSchema.set('timestamps', true);

listSchema.set('toObject', {
  virtuals: true,     
  versionKey: false, 
  transform: (doc, ret) => {
    delete ret._id; 
  }
});

listSchema.methods.serialize = function() {
  return {
    extra: this.extra || '',
    userId: this.userId ||'',
    id:this.id|| '',
  };
};

const List = mongoose.model('List', listSchema);

module.exports = {List};
