const { Router } = require("express");
const router = new Router();
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { isLoggedIn, isLoggedOut } = require("../middlewares/route-guard");

////////////GET  SIGN UP ///////////
router.get("/signup", async (req, res, next) => {
  res.render("auth/signup");
});
////////////POST  SIGN UP ///////////
router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;

  console.log({ username, password });
  try {
    if (!username || !password) {
      return res.render("auth/signup", {
        errorMessage: "Please fill out all of the fields!",
      });
    }
    if (password.length < 6) {
      return res.render("auth/signup", {
        errorMessage: "Please put a longer password",
      });
    }
    const foundUser = await User.findOne({ username: username });
    if (foundUser) {
      return res.render("auth/signup", {
        errorMessage: "Theres another one of you!",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userToCreate = {
      username,
      password: hashedPassword,
    };
    const userFromDb = await User.create(userToCreate);
    console.log(userFromDb);
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
});
//END SIGNUP\\

////////////GET  L O G I N ///////////

router.get("/login", async (req, res) => {
  res.render("auth/login");
});

////////////POST  L O G I N ///////////

router.post("/login", isLoggedOut, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.render("auth/login", {
        errorMessage: "Please fill out all of the fields!",
      });
    }

    const foundUser = await User.findOne(
      { username },
      { password: 1, username: 1 }
    );
    if (!foundUser) {
      return res.render("auth/login", {
        errorMessage: "Please sign up first!",
      });
    }

    const matchingPass = await bcrypt.compare(password, foundUser.password);
    if (!matchingPass) {
      return res.render("auth/login", {
        errorMessage: "Invalid passWord!",
      });
    }
    req.session.currentUser = foundUser;
    //Je ne comprends pas pourquoi le prefixage de /user n'est pas utilisable ici j'ai du remettre /user alors que dans l'index.js du route jai defini le prefixage /user...
    res.redirect("/user/profile");
  } catch (error) {
    next(error);
  }
});

//LOGOUT\\ // le button logout ne marche pas ....
router.get("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/login");
  });
});

//MAIN\\
router.get("/main", isLoggedIn, (req, res) => {
  let currentUser = req.session.user;
  if (currentUser) res.render("main", currentUser);
  else res.render("main");
});

router.get("/private", isLoggedIn, (req, res) => {
  let currentUser = req.session.user;
  if (currentUser) res.render("private", currentUser);
  else res.render("private");
});

module.exports = router;
