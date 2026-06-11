const { Router } = require('express');
const { requireAuth } = require('../../middleware/auth');
const { me, updateMe, changePassword, deleteMe } = require('./users.controller');

const router = Router();

router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/password', requireAuth, changePassword);
router.delete('/me', requireAuth, deleteMe);

module.exports = router;



