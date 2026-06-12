const authService = require('../auth/auth.service');

function me(req, res, next) {
  authService.getCurrentUserById(Number(req.user.id))
    .then((user) => res.json(user))
    .catch(next);
}

function updateMe(req, res, next) {
  authService.updateUser(Number(req.user.id), req.body)
    .then((user) => res.json(user))
    .catch(next);
}

function changePassword(req, res, next) {
  authService.changePassword(Number(req.user.id), req.body)
    .then((result) => res.json(result))
    .catch(next);
}

function deleteMe(req, res, next) {
  authService.deleteUser(Number(req.user.id))
    .then((result) => res.json(result))
    .catch(next);
}

module.exports = { me, updateMe, changePassword, deleteMe };
