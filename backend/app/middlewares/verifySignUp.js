const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ success: false, message: err });
      return;
    }

    if (user) {
      res.status(400).send({ success: false, message: "Tài khoản đã được sử dụng!" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ success: false, message: err });
        return;
      }

      if (user) {
        res.status(400).send({ success: false, message: "Tài khoản đã được sử dụng" });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          success: false, 
          message: `Lỗi! Quyền ${req.body.roles[i]} đã tồn tại!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;