const config = require("../../config/auth.config");
const db = require("../../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ 
        success: false, 
        message: err 
      });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ success: false, message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ success: false, message: err });
              return;
            }

            res.send({ success: true, message: "Đăng kí tài khoản thành công." });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ success: false, message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ success: false, message: err });
            return;
          }

          res.send({ success: true, message: "Đăng kí tài khoản thành công." });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ success: false, message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ success: false, message: "Tài khoản không tồn tại." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          success: false, 
          data: {
            accessToken: null,
          },
          message: "Mật khẩu không chính xác."
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        success: true, 
        data : {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        },
        message: "Đăng nhập thành công."
        
      });
    });
};