const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 32,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'please add a name'],
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Please add a email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    profile: {
      type: String,
      required: true,
    },
    hashed_password: {
      type: String,
      required: [true, 'please add a password'],
      minlength: 7,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    about: {
      type: String,
    },
    role: {
      type: Number,
      trim: true,
    },
    // role: {
    //     type: String,
    //     enum: ['user', 'publisher'],
    //     default: 'user'
    // },
    photo: {
      data: Buffer,
      contentType: String,
    },
    //For forget password we will generate the token and save into database,then we will email that token to
    // the user, they click then they will be redirected to the react application then react app will send that
    // token back to the server then will be verify
    resetPasswordLink: {
      data: String,
      default: '',
    },
    // ,
    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // }
  },
  { timestamp: true }
);

// Virtuals are document props that you can get & set but that doesnt persist to database
// we should not use arrow function here cause they dont have their own scope of this keyword
UserSchema.virtual('password')
  .set(function (password) {
    // create a temporary var _password
    this._password = password;
    // generate salt
    this.salt = this.makeSalt();
    // Encrypt password
    this.hashed_password = this.encryptpassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods.authenticate = async function (enteredPassword) {
  return (await this.encryptpassword(enteredPassword)) === this.hashed_password;
};

UserSchema.methods.encryptpassword = function (password) {
  if (!password) return '';
  try {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  } catch (err) {}
};

UserSchema.methods.makeSalt = function () {
  return Math.round(new Date().valueOf() * Math.random()) + '';
};

module.exports = mongoose.model('User', UserSchema);
