const { SECRET } = require("../../utils/config");
const jwt = require("jsonwebtoken");

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    console.log(authorization.substring(7));
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      res.status(401).json({ error: "token invalid" });
    }
  } else {
    res.status(401).json({ error: "token missing" });
  }
  next();
};

module.exports = {
  tokenExtractor,
};
