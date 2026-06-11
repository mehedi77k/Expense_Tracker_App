const { Router } = require('express');

const router = Router();

router.get('/me', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.patch('/me', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.patch('/me/password', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.delete('/me', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

module.exports = router;
