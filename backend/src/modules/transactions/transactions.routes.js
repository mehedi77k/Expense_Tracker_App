const { Router } = require('express');
const { list, create, getOne, update, remove, summary, exportTransactions } = require('./transactions.controller');

const router = Router();

router.get('/', list);
router.post('/', create);
router.get('/summary', summary);
router.get('/export', exportTransactions);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
