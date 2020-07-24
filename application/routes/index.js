var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:"Image App"});
});
router.get('/login.hbs',(req, res, next)=> {
  res.render("login", {title:"Login"});
});
router.get('/registration.hbs',(req, res, next) => {
  res.render("registration", {title:"Registration"});
});
router.get('/postimage.hbs',(req, res, next) => {
  res.render("postimage", {title:"Post Image"});
});
router.get('/imagepost.hbs',(req, res, next) => {
  res.render("imagepost", {title:"Image Post"});
});
module.exports = router;
