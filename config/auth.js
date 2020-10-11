const Comment = require('../Database/models/commentModel');
const Blog = require('../Database/models/blogModel');
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please Login First');
    res.redirect('/users/login');
  },
  checkCommentOwnerShip: function (req, res, next) {
    if (req.isAuthenticated()) {
      Comment.findById(req.params.id, (err, comment) => {
        if (err) {
          res.redirect('back');
        } else {
          //does the user own the blog
          if (comment.author.id.equals(req.user._id)) {
            next();
          } else {
            res.redirect('back');
          }
        }
      });
    } else {
      req.flash();
      res.redirect('back');
    }
  },
  checkBlogOwnerShip: function checkBlogOwnerShip(req, res, next) {
    if (req.isAuthenticated()) {
      Blog.findById(req.params.id, (err, article) => {
        if (err) {
          res.redirect('back');
        } else {
          //does the user own the blog
          if (article.author.id.equals(req.user._id)) {
            next();
          } else {
            res.redirect('back');
          }
        }
      });
    } else {
      req.flash();
      res.redirect('back');
    }
  },
};
