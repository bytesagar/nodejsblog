const router = require('express').Router();

const Blog = require('../Database/models/blogModel');
const User = require('../Database/models/userModel');

const { ensureAuthenticated, checkBlogOwnerShip } = require('../config/auth');
//currentUser Middleware
router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('articles/new', { article: new Blog(), title: 'New Blog Post' });
});

router.get('/edit/:id', checkBlogOwnerShip, async (req, res) => {
  Blog.findById(req.params.id, (err, article) => {
    res.render('articles/edit', { article: article, title: 'Edit Blog' });
  });
});

router.get('/:slug', async (req, res) => {
  await Blog.findOne({ slug: req.params.slug })
    .populate('comments')
    .exec((err, article) => {
      if (err) {
        console.log(err);
      }
      if (article == null) res.redirect('/');
      res.render('articles/show', { article: article, title: article.slug });
    });
});
router.post(
  '/',
  async (req, res, next) => {
    req.article = new Blog();
    next();
  },
  saveArticleUpdateAndRedirect('new')
);

//EDIT ARTICLE ROUTE
router.put(
  '/:id',
  checkBlogOwnerShip,
  ensureAuthenticated,
  async (req, res, next) => {
    // await Blog.findByIdAndUpdate(req.params.id, {title: req.body.title, markdown: req.body.markdown})
    req.article = await Blog.findById(req.params.id);
    next();
  },
  editArticleAndRedirect('edit')
);

//DELETE ARTICLE ROUTE
router.delete(
  '/:id',
  checkBlogOwnerShip,
  ensureAuthenticated,
  async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/');
  }
);

function saveArticleUpdateAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;

    //capitalize the first letter of user
    username = req.user.name;

    //FOR USERS COLLECTION
    blog = req.article._id;
    capital = username.charAt(0).toUpperCase() + username.slice(1);
    article.author = {
      username: capital,
      id: req.user._id,
      email: req.user.email,
    };
    article.title = req.body.title;
    article.markdown = req.body.markdown.trim();

    try {
      article = await article.save();
      //SAVE THE BLOG ID IN USERS COLLECTION
      await req.user.blog.push(blog);
      console.log(req.user.blog);
      req.user.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (err) {
      console.log(err);
      res.render(`articles/${path}`, { article: article, title: 'New blog' });
    }
  };
}
function editArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;

    //capitalize the first letter of user
    username = req.user.name;
    capital = username.charAt(0).toUpperCase() + username.slice(1);
    article.author = {
      username: capital,
      id: req.user._id,
      email: req.user.email,
    };
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;

    try {
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (err) {
      console.log(err);
      res.render(`articles/${path}`, { article: article, title: 'Edit Blog' });
    }
  };
}

module.exports = router;
