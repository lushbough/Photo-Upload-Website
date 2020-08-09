var db = require("../conf/database");
const PostModel = {};

PostModel.create = (title, description, photopath, thumbnail, fk_userId) => {
    let baseSQL = 'INSERT INTO posts (title, description, photopath, thumbnail, created, fk_userid) VALUE(?,?,?,?, now(),?);;';
    return db.execute(baseSQL, [title, description, photopath, thumbnail, fk_userId,])
        .then(([results, fields]) => {
            return Promise.resolve(results && results.affectedRows);
        })
        .catch((err) => Promise.reject(err));
};

PostModel.search = (searchTerm) => {
    let baseSQL = "SELECT id, title, description, thumbnail, concat_ws(' ', title, description) AS haystack \
            FROM posts \
            HAVING haystack like ?;";
    let sqlReadySearchTerm = "%" + searchTerm + "%";
    return db.execute(baseSQL, [sqlReadySearchTerm])
    .then(([results, fields]) => {
        return Promise.resolve(results);
    })
        .catch((err) => Promise.reject(err));

};

PostModel.getNRecentPosts = (numberOfPosts) => {
    let baseSQL = 'SELECT id, title, description, thumbnail, created FROM posts ORDER BY created DESC LIMIT ?';
    return db.execute(baseSQL, [numberOfPosts]).then(([results, fields]) => {
        return Promise.resolve(results);
            })
        .catch((err) => Promise.reject(err));
};

module.exports = PostModel;