var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:"Image App"});
}); //changed from just index

router.get('/login.hbs',(req, res, next) => {
  res.render('login', {title:"Login"});
})
router.get('/registration.hbs',(req, res, next) => {
  res.render('registration', {title:"Registration"});
})
router.get('/imagepost.hbs',(req, res, next) => {
  res.render('imagepost', {title:"Image Post"});
})

router.use('/postimage.hbs', isLoggedIn);
router.get('/postimage.hbs', (req, res, next) => {
  res.render('postimage', {title:"Post Image"});
});


module.exports = router;
