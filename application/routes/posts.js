var express = require('express');
var router = express.Router();
var db = require("../conf/database");
const {successPrint, errorPrint} = require("../helpers/debug/debugprinters");
var sharp = require('sharp');
var multer = require('multer');
var crypto = require('crypto');
var PostError = require('../helpers/error/PostError');
const {route} = require('.');

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


router.post('/createPost', uploader.single("uploadImage"), (req, res, next) => {
    let fileUploaded = req.file.path;
    let fileAsThumbnail = `thumbnail-${req.file.filename}`;
    let destinationOfThumbnail = req.file.destination + "/" + fileAsThumbnail;
    let title = req.body.title
    let description = req.body.description;
    let fk_userId = req.session.userId;
    // console.log(req);
    //res.send('');
    //must do server validation on your own
    //express validation module
    //if any values that are used for the insert statement
    //are undefined, mysql.query or mysql.execute will fail
    //with the following error:
    //BIND parameters cannot be undefined
    //

    sharp(fileUploaded)
        .resize(200)
        .toFile(destinationOfThumbnail)
        .then(() => {
            let baseSQL = 'INSERT INTO posts (title, description, photopath, thumbnail, created, fk_userid) VALUE(?,?,?,?, now(),?);;';
            return db.execute(baseSQL, [title, description, fileUploaded, destinationOfThumbnail, fk_userId]);
        })
        .then(([results, fields]) => {
            if (results && results.affectedRows) {
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
        })
});

//localhost:3000/post/search?search=value
router.get('/search', (req, res, next) => {
    let searchTerm = req.query.search;
    //after question mark the key is search
    if (!searchTerm) {
        res.send({
            resultsStatus: "info",
            message: "no search term given",
            results: []
        });
    } else {
        let baseSQL = "SELECT id, title, description, thumbnail, concat_ws(' ', title, description) AS haystack \
            FROM posts \
            HAVING haystack like ?;";
        let sqlReadySearchTerm = "%" + searchTerm + "%";
        db.execute(baseSQL, [sqlReadySearchTerm])
            .then(([results, fields]) => {
                if (results && results.length) {
                    res.send({
                        resultsStatus: "info",
                        message: `${results.length} results found`,
                        results: results
                    });
                } else {
                    db.query('SELECT id, title, description, thumbnail, created FROM posts ORDER BY created LIMIT 6', [])
                        .then(([results, fields]) => {
                            res.send({
                                resultsStatus: "info",
                                message: "no results were found for your search but here are the 6 most recent posts",
                                results: results
                            });
                        })
                }
            })
            .catch((err) => next(err))
    }
});

module.exports = router;