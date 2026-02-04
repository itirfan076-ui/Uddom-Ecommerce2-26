const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // নিশ্চিত করুন এই সিক্রেটটি লগইন রাউটের সাথে মিলছে
    const secret = "Uddom_Secret_2026"; 
    const decoded = jwt.verify(token, secret);

    req.user = decoded.id; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};