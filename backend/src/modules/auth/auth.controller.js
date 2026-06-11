const authService = require('./auth.service');

function register(req, res, next) {
  authService.register(req.body)
    .then((result) => res.status(201).json(result))
    .catch(next);
}

function login(req, res, next) {
  authService.login(req.body)
    .then((result) => res.json(result))
    .catch(next);
}

function refresh(req, res, next) {
  authService.refresh(req.body.refreshToken)
    .then((result) => res.json(result))
    .catch(next);
}

function logout(req, res, next) {
  Promise.resolve(authService.logout(req.body.refreshToken))
    .then((result) => res.json(result))
    .catch(next);
}

module.exports = { register, login, refresh, logout };
