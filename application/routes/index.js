var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/login.hbs',(req, res, next)=> {
  res.render("login");
});
router.get('/registration.hbs',(req, res, next) => {
  res.render("registration");
});
router.get('/postimage.hbs',(req, res, next) => {
  res.render("postimage");
});
router.get('/imagepost.hbs',(req, res, next) => {
  res.render("imagepost");
});
module.exports = router;
