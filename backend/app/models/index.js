const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./userModels/user.model");
db.role = require("./roleModels/role.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;