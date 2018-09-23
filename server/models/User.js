const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required:[true,'First Name is required']
  },
  lastName: {
    type: String,
    default:''
  },
  email: {
    type: String,
    required:[true,'Email is required']    
  },
  password: {
    type: String,
    required:[true,'Password is required']    
  },
  isDeleted:{
      type:Boolean,
      default:false
  }
});
UserSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null)
}
UserSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password)
}
module.exports = mongoose.model('User', UserSchema);
