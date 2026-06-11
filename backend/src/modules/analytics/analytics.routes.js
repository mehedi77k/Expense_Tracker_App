const { Router } = require('express');

const router = Router();

router.get('/overview', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/by-category', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/trend', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/top-spending', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.get('/monthly-comparison', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

module.exports = router;
