const { successPrint, errorPrint} = require("../helpers/debug/debugprinters");
const routeProtectors = {};

//express receives request mw1->mw2->mwN->router.HTTPVERB
routeProtectors.userIsLoggedIn = function(req, res, next) {
    if(req.session.username) {
        successPrint('User is logged in');
        next();
    }else{
        errorPrint('user is not logged in');
        req.flash('error', 'You must be logged in to create a post');
        res.redirect('/login.hbs');
    }
}

module.exports = routeProtectors;