var express = require("express");
var router = express.Router();
var db = require("../conf/database");
const UserError = require("../helpers/error/UserError");
const { successPrint, errorPrint} = require("../helpers/debug/debugprinters");
var bcrypt = require("bcrypt");






router.post('/register', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let confirmPassword = req.body.password;
  let email = req.body.email; //ask for help

//do server side validation on your own
//no video


  //if the User exists then lets check the email
  db.execute("SELECT * FROM users WHERE username=?", [username]).then(
      ([results, fields]) => {
        if (results && results.length == 0) {
          return db.execute("SELECT * FROM users WHERE email=?", [email]);
        } else {
          throw new UserError(
              "Registration Failed: Username already exists",
              "/registration.hbs",
              200
          );
        }
      })
      .then(([results, fields]) => {
        if (results && results.length == 0) {
         return bcrypt.hash(password,15);
        } else {
          throw new UserError(
              "Registration Failed: Email already exists",
              "/registration.hbs",
              200
          );
        }
  })
      .then((hashedPassword) => {

          let baseSQL = "INSERT INTO users(username, email, password, created) VALUES (?,?,?,now());"
          return db.execute(baseSQL, [username, email, hashedPassword])

      }).then(([results, fields]) => {
        if (results && results.affectedRows) {
          successPrint("user.js was created!!");
          req.flash('success', 'User account has been made!');
          res.redirect("/login"); //maybe hbs
        } else {
          throw new UserError(
              "Server error, user could not be created",
              "/registration.hbs",
              500
          );
        }
      }).catch((err) => {
        errorPrint("user could not be made", err);
        if (err instanceof UserError) {
          errorPrint(err.getMessage());
          req.flash('error', err.getMessage());
          res.status(err.getStatus());
          res.redirect(err.getRedirectURL());
        } else {
          next(err);
        }
      });
});



router.post('/login', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  //do server side validation on your own

  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;"
    let userId;
  db.execute(baseSQL,[username])
      .then(([results, fields]) => {
        if(results && results.length ==1) {
          let hashedPassword = results[0].password;
          userId = results[0].id; //or .id
          return bcrypt.compare(password, hashedPassword);
          //res.redirect('/');
        }else {
          throw new UserError("invalid username and/or password!", "/login", 200);
        }
      })
      .then((passwordsMatched) => {
        if (passwordsMatched) {
           successPrint(`User ${username} is logged in`);
           req.session.username = username;
           req.session.userId = userId;
           res.locals.logged = true;
           req.flash('success', 'You have been successfully Logged in!');
           res.redirect('/');
        }else {
          throw new UserError("Invalid username and/or password!", "/login", 200);
        }
      })
      .catch((err) => {
        errorPrint("user login failed");
        if(err instanceof UserError) {
          errorPrint(err.getMessage());
            req.flash('error', err.getMessage());
            res.status(err.getStatus());
          res.redirect('/login');
        }else {
          next(err);
        }
  })
});

router.post('/logout', (req, res, next) => {
   req.session.destroy((err) => {
       if(err) {
           errorPrint('session could not be destroyed.');
           next(err);
       } else {
           successPrint('Session was destroyed');
           res.clearCookie('cslid');
           res.json({status: "OK", message: "user is logged out"});
       }
   })
});

//do server side validation on your own

module.exports = router;

