var express = require('express');
var router = express.Router();


//above for validation

var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
var getRecentPosts = require('../middleware/postsmiddleware').getRecentPosts;
var db = require("../conf/database");



/* GET home page. */
router.get('/', getRecentPosts, function(req, res, next) {
  res.render('index', {title:"Image App"});
 // req.session.errors = null;
}); //

router.get('/login.hbs',(req, res, next) => {
  res.render('login', {title:"Login"});
})
router.get('/registration.hbs',(req, res, next) => {
  res.render('registration', {title:"Registration"});
})

router.use('/postimage.hbs', isLoggedIn);
router.get('/postimage.hbs', (req, res, next) => {
  res.render('postimage', {title:"Post Image"});
});

router.get('/post/:id(\\d+)', (req, res, next) => {


  let baseSQL = "SELECT u.username, p.title, p.description, p.photopath, p.created \
        FROM users u \
        JOIN posts p \
        ON u.id=fk_userid \
        WHERE p.id=?;";

  let postId = req.params.id;
  //needed for server side validation
  db.execute(baseSQL, [postId])
      .then(([results, fields]) => {
        if(results && results.length) {
          let post = results[0];
          res.render('imagepost', {currentPost: post});
        }else {
          req.flash('error', 'This is not the post you are looking for!');
          res.redirect('/');
        }
      })
});


router.get('/imagepost.hbs',(req, res, next) => {
  res.render('imagepost', {title:"Image Post"});
})



module.exports = router;
