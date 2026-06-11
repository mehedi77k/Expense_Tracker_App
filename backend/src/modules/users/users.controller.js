const authService = require('../auth/auth.service');

function me(req, res, next) {
  Promise.resolve(authService.getCurrentUserById(Number(req.user.id)))
    .then((user) => res.json(user))
    .catch(next);
}

function updateMe(_req, res) {
  res.status(501).json({ message: 'Not implemented yet' });
}

function changePassword(_req, res) {
  res.status(501).json({ message: 'Not implemented yet' });
}

function deleteMe(_req, res) {
  res.status(501).json({ message: 'Not implemented yet' });
}

module.exports = { me, updateMe, changePassword, deleteMe };
