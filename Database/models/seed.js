const mongoose = require('mongoose');
const Blog = require('../models/blogModel');
const Comment = require('../models/commentModel');
let data = [
  {
    title: 'First Blog',
    markdown: '# This is the first blog post. #### This is sagars post',
  },
  {
    title: 'Second Blog',
    markdown: '# This is the first blog post. #### This is sagars post',
  },
  {
    title: 'Third Blog',
    markdown: '# This is the first blog post. #### This is sagars post',
  },
];
const seedDB = () => {
  Blog.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('Removed all blogs');

    //     //Add a blog
    // data.forEach((seed) => {
    //     Blog.create(seed, (err, blog) => {
    //         if (err) {
    //             console.log(err)
    //         }
    //         console.log("added a blog")
    //         //Create a comment
    //         Comment.create({
    //             text: "This place is great",
    //             author: "sagar"
    //         }, (err, comment) => {
    //             if (err) {
    //                 console.log(err)
    //             }
    //             blog.comments.push(comment)
    //             blog.save()
    //             console.log("Created new comment")
    //         })
    //     })
    // })
  });
};

module.exports = seedDB;
