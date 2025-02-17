const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/jwtTokenKey");
const Response = require("../../classes/Response");
const { Op, QueryTypes } = require("sequelize");
const db = require("../../config/db.config")

const verifyToken = async (req, res, next) => {
  if (req.headers['authorization'] == undefined) {
    return res.status(401).send(Response.sendResponse(false, null, 'A token is required for authentication', 401));
  }
  const token = req.headers['authorization'].split(' ')[1];

  if (!token) 
    return res.status(401).send(Response.sendResponse(false, null, 'A token is required for authentication',401));
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
  } catch (err) {
    return res.status(401).send(Response.sendResponse(false, null, 'Invalid Token',401));
  }

  return next();
};

module.exports = verifyToken;
