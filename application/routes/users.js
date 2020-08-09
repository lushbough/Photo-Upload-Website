var express = require("express");
var router = express.Router();
var db = require("../conf/database");
const UserModel = require('../models/Users');
const UserError = require("../helpers/error/UserError");
const {successPrint, errorPrint} = require("../helpers/debug/debugprinters");
var bcrypt = require("bcrypt");
const {body, validationResult} = require('express-validator');


router.post('/register', [body('email').isEmail(), body('password').isLength({min: 2})], (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.password;
    let email = req.body.email; //ask for help


//do server side validation on your own
//no video
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({errors:errors.array()});
        console.log(errors);
        res.redirect('/registration.hbs')
    }
    UserModel.usernameExists(username)
        .then((userDoesNameExist) => {
            if (userDoesNameExist) {
                throw new UserError(
                    "Registration Failed: Username already exists",
                    "/registration.hbs",
                    200
                );
            } else {
                UserModel.emailExists(email);
            }
        })
        .then((emailDoesExist) => {
            if (emailDoesExist) {
                throw new UserError(
                    "Registration Failed: Email already exists",
                    "/registration.hbs",
                    200
                );
            } else {
                return UserModel.create(username, password, email);
            }
        })
        .then((createdUserId) => {
            if (createdUserId < 0) {
                throw new UserError(
                    "Server error, user could not be created",
                    "/registration.hbs",
                    500
                );
            } else {
                successPrint("user.js was created!!");
                req.flash('success', 'User account has been made!');
                res.redirect("/login.hbs");
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

router.post('/login', [body('username').isLength({min: 1}), body('password').isLength({min: 2})], (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    //do server side validation on your own

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({errors:errors.array()});
        console.log(errors);
        res.redirect('/login.hbs')
    } else {
        UserModel.authenticate(username, password)
            .then((loggedUserId) => {
                if (loggedUserId > 0) {
                    successPrint(`User ${username} is logged in`);
                    req.session.username = username;
                    req.session.userId = loggedUserId;
                    res.locals.logged = true;
                    req.flash('success', 'You have been successfully Logged in!');
                    res.redirect('/');
                } else {
                    throw new UserError("Invalid username and/or password!", "/login.hbs", 200);
                }
            })
            .catch((err) => {
                errorPrint("user login failed");
                if (err instanceof UserError) {
                    errorPrint(err.getMessage());
                    req.flash('error', err.getMessage());
                    res.status(err.getStatus());
                    res.redirect('/login.hbs');
                } else {
                    next(err);
                }
            })
    }
});

router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            errorPrint('session could not be destroyed.');
            next(err);
        } else {
            successPrint('Session was destroyed');
            res.clearCookie('cslid');
            res.json({status: "OK", message: "user is logged out"});
        }
    })
});

module.exports = router;

