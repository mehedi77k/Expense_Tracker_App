const { Router } = require('express');

const router = Router();

router.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.patch('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
router.delete('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

module.exports = router;
