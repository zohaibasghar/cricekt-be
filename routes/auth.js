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
  //this should be an async function and use await before saving the user
  async (req, res) => {
    try {
      const data = req.body;
      if (data.password.length < 8) {
        return res
          .status(422)
          .json({ error: "Password must contain 8 characters!" });
      }
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(data.email)) {
        return res.status(422).json({ error: "Please enter a valid email!" });
      }
      if (!data.name) {
        return res.status(422).json({ error: "Enter your name!" });
      }
      const exist = await User.findOne({ email: data.email });
      if (exist) {
        return res.status(409).json({ error: "Email already registered!" });
      }
      //bcrypt hashing method
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(data.password, salt);

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
        return res.status(404).json({ error: "email is not correct" });
      } else {
        var passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
          return res.status(422).json({ error: "password is not correct" });
        } else {
          const data = {
            user: {
              id: user.id,
            },
          };
          console.log(data);
          const authToken = jwt.sign(data, JWT_secret);
          return res.status(200).json({ passCompare, authToken, user });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "server error occured" });
    }
  }
);

//End point: authenticate a user login
router.get("/fetchuser", fetchUser, async (req, res) => {
  try {
    let userId = await req.user.id;
    const user = await User.findById(userId).select("-password");
    return res.status(200).send(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server error occured" });
  }
});

//End point: change password
router.patch(
  "/change-password",
  fetchUser,
  [
    body("currentPassword", "Current password is required").not().isEmpty(),
    body("newPassword", "New password length must be at least 8").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword, email } = req.body;

      // Express validator errors logging
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the user by id or email
      const user = await User.findOne({
        $or: [
          { email }, // Replace with the correct field name where the email is coming from
          { _id: req.user.id },
        ],
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      // Update the password
      user.password = hash;
      await user.save();

      return res.status(200).send({
        message: "Password changed successfully",
      });
    } catch (error) {
      return res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
);

//End point: reset password
router.patch(
  "/reset-password",
  [
    body("newPassword", "New password length must be at least 8").isLength({
      min: 8,
    }),
    body("email", "Email is required").exists(),
  ],
  async (req, res) => {
    try {
      const { newPassword, email } = req.body;

      // Express validator errors logging
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the user by id or email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      // Update the password
      user.password = hash;
      await user.save();

      return res.status(200).send({
        message: "Password changed successfully",
      });
    } catch (error) {
      return res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
);

module.exports = router;
