const { Router } = require('express');
const { register, login, refresh, logout } = require('./auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/reset-password', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

module.exports = router;
