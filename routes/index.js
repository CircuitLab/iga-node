
/*
 * GET /
 */

exports.index = function(req, res){
  if (!req.user) return res.redirect('/login');
  res.render('index', { user: req.user._json });
};

/*
 * GET /login
 */

exports.login = function(req, res){
  res.render('login');
};
