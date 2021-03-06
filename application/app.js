var express = require('express');
var path = require('path');


var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sessions = require('express-session');
var mysqlSession = require('express-mysql-session')(sessions);
var flash = require('express-flash');
var handlebars = require('express-handlebars');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var dbRouter = require('./routes/dbtest');
var errorPrint = require('./helpers/debug/debugprinters').errorPrint;
var requestPrint = require('./helpers/debug/debugprinters').requestPrint;
// const { body, validationResult } = require('express-validator');
var expressSession = require('express-session');

var app = express();
app.engine(
    "hbs",
    handlebars({
            layoutsDir: path.join(__dirname, "views/layouts"),
            partialsDir: path.join(__dirname, "views/partials"),
            extname: ".hbs",
            defaultLayout: "home",
            helpers: {
                emptyObject: (obj) => {
                    return !(obj.constructor === Object && Object.keys(obj).length == 0);
                }

                /**
                 * if you need helpers register here
                 */
            }

        }
    )
);

var mysqlSessionStore = new mysqlSession(
    {
        /*using default options*/
    },
    require("./conf/database")
);

app.use(sessions({
    key: "csid",
    secret: "this is a secret from csc317",
    store: mysqlSessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.set("view engine", "hbs");
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//after body parser

//app.use(expressValidator());
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}
));

app.use((req, res, next) => {
    requestPrint(req.url);
    next();
});

app.use((req, res, next) => {
    console.log(req.session);
    if (req.session.username) {
        res.locals.logged = true;
    }
    next();
})


app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use('/posts', postsRouter);
app.use('/dbtest', dbRouter);


app.use((err, req, res, next) => {
    //errorPrint(err);
    console.log(err);
    res.render("error", {err_message: err});
});

module.exports = app;
