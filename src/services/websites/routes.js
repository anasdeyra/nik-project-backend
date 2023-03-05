const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {
  getWebsites,
  addWebsite,
  removeWebsite,
  updateAllWebsites,
} = require("./controller");

//check for authorization header and verify the token if it exists
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
router.get("/getAll", getWebsites);

router.use(verifyToken);

router.post("/add", addWebsite);
router.delete("/remove/:id", removeWebsite);
router.put("/updateAll", updateAllWebsites);

module.exports = router;
