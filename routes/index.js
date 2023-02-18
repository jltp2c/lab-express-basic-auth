const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.use("/auth", require("./auth.routes"));
router.use("/user", require("./user.routes"));

module.exports = router;
