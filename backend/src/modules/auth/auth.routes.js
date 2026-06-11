const { Router } = require('express');

const router = Router();

router.post('/register', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/login', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/refresh', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/logout', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/forgot-password', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/reset-password', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

module.exports = router;
