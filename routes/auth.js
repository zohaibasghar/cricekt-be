const express = require("express");
const User = require("../models/Users");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // express value validator
const fetchUser = require("../middleware/fetchuser"); // middle ware

const JWT_secret = "MianIsKING$";
// this is a post end point ('/api/auth/createUser)
router.post(
  "/createUser",
  [
    //this is express validator rules array
    body("name", "Minimum length is 2").isLength({ min: 2 }),
    body("email", "Must be an email").isEmail(),
    body("password", "password length must be 8").isLength({ min: 8 }),
  ],
  //this should be an async function and use await before saving the user
  async (req, res) => {
    try {
      const data = req.body;

      //bcrypt hashing method
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(data.password, salt);

      // express validator errors logging
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        //must await for the user to save in the database
        const newUser = await new User({
          name: data.name,
          email: data.email,
          password: hash,
          mobile: data.mobile,
        }).save();

        //JWT used to generate a token
        const jwtID = {
          user: {
            id: newUser.id,
          },
        };
        const authToken = jwt.sign(jwtID, JWT_secret);

        res.status(201).send({
          authToken: authToken,
          user: newUser,
        });
      }
    } catch (error) {
      res.send({
        code: 401,
        error: true,
        message: error.message,
      });
    }
  }
);

// End point: get request login at /api/auth/login
router.post(
  "/login",
  [
    //this is express validator rules array
    body("email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  //this should be an async function and use await before saving the user
  async (req, res) => {
    try {
      // express data validator only for email yet
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //comparing email and password from login request
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.json({ error: "email is not correct" });
      } else {
        var passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
          res.json({ error: "password is not correct" });
        } else {
          const data = {
            user: {
              id: user.id,
            },
          };
          console.log(data);
          const authToken = jwt.sign(data, JWT_secret);
          res.json({ passCompare, authToken, user });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "some error occured" });
    }
  }
);

//End point: authenticate a user login
router.get("/fetchuser", fetchUser, async (req, res) => {
  try {
    let userId = await req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "some error occured" });
  }
});

module.exports = router;
