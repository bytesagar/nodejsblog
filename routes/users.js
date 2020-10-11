const router = require('express').Router();
const User = require('../Database/models/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require('../config/auth');

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

//Login Page
router.get('/login', (req, res) =>
  res.render('login', { title: 'User Login' })
);

//Register Page
router.get('/register', (req, res) =>
  res.render('register', { title: 'User Register' })
);

//Register handel
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all the fields!' });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  //check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters!' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
    });
  } else {
    //Validation Pass
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        errors.push({ msg: 'Email Already Exists!' });
        res.render('register', {
          errors,
          name,
          email,
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
          blog: [],
        });
        console.log(newUser);
        //hash password
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hash password
            newUser.password = hash;

            const confirmCode = Math.floor(1000 + Math.random() * 9000);
            newUser.confirmationCode = confirmCode;
            //save user to database
            newUser
              .save()
              .then((user) => {
                req.flash('success_msg', 'A confirmation code has been sent');
                res.redirect('/users/confirmation');
                return transporter.sendMail({
                  from: 'email@email.com',
                  to: user.email,
                  subject: 'Confirm Verification || Blog App || Fusobotics',
                  text: `Account Verification Code: ${confirmCode}`,
                });
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

//Logout handel
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

//verify account
router.get('/confirmation', (req, res) => {
  res.render('confirmation', {
    currentUser: req.currentUser,
    title: 'Email confirmation',
  });
});

router.post('/confirmation', (req, res) => {
  const confirmCode = req.body.confirmationCode;
  User.findOne({ confirmationCode: confirmCode }).then((user) => {
    if (user.confirmationCode !== confirmCode) {
      console.log('Code does not match');
    } else {
      user.isVerified = true;
      user.save();
      console.log(user);
      req.flash('success_msg', 'Account verified. Now you can Login ');
      return res.redirect('/users/login');
    }
  });
});

router.get('/reset', (req, res) => {
  res.render('reset', { title: 'Password Reset' });
});

router.post('/reset', (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/users/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error_msg', 'No account with that email');
          return res.redirect('/users/reset');
        }
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter.sendMail({
          from: 'sagarkarki34@outlook.com',
          to: req.body.email,
          subject: 'Password reset',
          text: `Please Click the link below to reset your password \n http://${req.headers.host}/users/reset/${token}`,
        });
      });
  });
});

router.get('/reset/:token', (req, res) => {
  const token = req.params.token;
  console.log(token);
  User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })
    .then((user) => {
      console.log(user);
      const userId = user._id;
      res.render('new-password', {
        userId,
        passwordToken: token,
        title: 'New Password',
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/new-password', (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  console.log(userId);
  const passwordToken = req.body.passwordToken;
  console.log(passwordToken);
  let resetUser;

  User.findOne({
    _id: userId.trim(),
    resetToken: passwordToken.trim(),
    resetTokenExpire: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 10);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpire = undefined;
      return resetUser.save();
    })
    .then((result) => {
      req.flash('success_msg', 'Your password has been reset.');
      res.redirect('/users/login');
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
