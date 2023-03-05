const jwt = require("jsonwebtoken");

const ADMINS = [{ username: "admin", password: "admin" }];

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = ADMINS.find(
      (admin) => admin.username === username && admin.password === password
    );
    if (user) {
      const token = jwt.sign({ username }, process.env.SECRET_KEY);
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
};
