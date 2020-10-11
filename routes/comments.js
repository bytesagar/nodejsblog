const router = require('express').Router();
const Blog = require('../Database/models/blogModel');
const Comment = require('../Database/models/commentModel');
const Reply = require('../Database/models/replyModel');
const {
  ensureAuthenticated,
  checkCommentOwnerShip,
} = require('../config/auth');

router.get('/:slug/comments/new', ensureAuthenticated, (req, res) => {
  Blog.findOne({ slug: req.params.slug }, (err, blog) => {
    if (err) {
      console.log(err);
    }
    res.render('comments/new', {
      blog: blog,
      title: `${req.params.slug} new comment`,
    });
  });
});

//USER CAN COMMENT
router.post('/:slug/comments', ensureAuthenticated, (req, res) => {
  Blog.findOne({ slug: req.params.slug }, (err, blog) => {
    if (err) {
      console.log(err);
      res.redirect('/articles/:slug');
    }
    Comment.create(
      {
        text: req.body.text,
        author: req.body.author,
      },
      (err, comment) => {
        if (err) {
          console.log(err);
        }
        //add name and id to commnt
        comment.author.id = req.user._id;
        comment.author.username = req.user.name;
        //save comment
        comment.save();
        blog.comments.push(comment);
        blog.save();
        res.redirect('/articles/' + blog.slug);
      }
    );
  });
});

router.get(
  '/:slug/comments/:id/edit',
  ensureAuthenticated,
  checkCommentOwnerShip,
  (req, res) => {
    Comment.findById(req.params.id, (err, comment) => {
      if (err) {
        console.log(err);
        req.redirect('back');
      } else {
        res.render('comments/edit', {
          slug: req.params.slug,
          comment: comment,
          title: 'Edit Comment',
        });
      }
    });
  }
);

//COMMENT EDIT ROUTE
router.put(
  '/:slug/comments/:id',
  ensureAuthenticated,
  checkCommentOwnerShip,
  async (req, res) => {
    try {
      await Comment.findByIdAndUpdate(
        req.params.id,
        { text: req.body.text },
        { new: true }
      );
      res.redirect('/articles/' + req.params.slug);
    } catch (err) {
      console.log(err);
      res.redirect('back');
    }
  }
);

//COMMENT DESTROY ROUTE

router.delete(
  '/:slug/comments/:id',
  checkCommentOwnerShip,
  async (req, res) => {
    await Comment.findByIdAndRemove(req.params.id);
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (blog) {
      let comments = blog.comments.filter(
        (commentId) => commentId != req.params.id
      );
      await blog.updateOne({ comments });
    }
    res.redirect('/articles/' + req.params.slug);
  }
);

module.exports = router;
