const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/profile", isLoggedIn, (req, res) => {
  res.locals.currentUser = req.session.currentUser;
  res.render("profile");
});

module.exports = router;
