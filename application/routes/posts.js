var express = require('express');
var router = express.Router();
const {successPrint, errorPrint} = require("../helpers/debug/debugprinters");
var sharp = require('sharp');
var multer = require('multer');
const path = require('path');
var crypto = require('crypto');
var PostError = require('../helpers/error/PostError');
const { check, validationResult } = require('express-validator');
var PostModel = require('../models/Posts');



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/uploads");
    },
    filename: function (req, file, cb) {
        let fileExt = file.mimetype.split('/')[1];
        let randomName = crypto.randomBytes(22).toString("hex");
        cb(null, `${randomName}.${fileExt}`);
    }
});

var uploader = multer({storage: storage});

// check('title').isLength({min: 2}),
router.post('/createPost', uploader.single("uploadImage"), (req, res, next) => {
    let fileUploaded = req.file.path;
    let fileAsThumbnail = `thumbnail-${req.file.filename}`;
    let destinationOfThumbnail = req.file.destination + "/" + fileAsThumbnail;
    let title = req.body.title;
    let description = req.body.description;
    let fk_userId = req.session.userId;


        sharp(fileUploaded)
            .resize(200)
            .toFile(destinationOfThumbnail)
            .then(() => {
                return PostModel.create (
                title, description, fileUploaded, destinationOfThumbnail, fk_userId,);
            })
            .then((postWasCreated) => {
                if (postWasCreated) {
                    req.flash('success', "Your post was created successfully.");
                    res.redirect('/');
                } else {
                    throw new PostError('Post could not be created!!', 'postImage', 200);
                }
            })
            .catch((err) => {
                if (err instanceof PostError) {
                    errorPrint((err.getMessage()));
                    req.flash('error', err.getMessage());
                    res.status(err.getStatus());
                    res.redirect(err.getRedirectURL());
                } else {
                    next(err);
                }
            });
  //  }
});

//localhost:3000/post/search?search=value
router.get('/search', async (req, res, next) => {
    try {
        let searchTerm = req.query.search;
        //after question mark the key is search
        if (!searchTerm) {
            res.send({
                resultsStatus: "info",
                message: "no search term given",
                results: []
            });
        } else {
            let results = await PostModel.search(searchTerm);
            if (results.length) {
                res.send({
                    message: `${results.length} results found`,
                    results: results
                });
            } else {
                let results = await PostModel.getNRecentPosts(6);
                res.send({
                    resultsStatus: "info",
                    message: "no results were found for your search but here are the 6 most recent posts",
                    results: results,
                });
            }
        }
    }catch(err) {
        next(err);
    }
});

module.exports = router;