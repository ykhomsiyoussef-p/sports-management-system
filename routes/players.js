const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { playerValidationRules, handleValidationErrors } = require('../middleware/validators');
const { requireAdmin } = require('../middleware/auth');

router.get('/', playerController.index);
router.get('/new', requireAdmin, playerController.newForm);
router.post('/', requireAdmin, playerValidationRules, handleValidationErrors, playerController.create);
router.get('/:id', playerController.show);
router.get('/:id/edit', requireAdmin, playerController.editForm);
router.put('/:id', requireAdmin, playerValidationRules, handleValidationErrors, playerController.update);
router.delete('/:id', requireAdmin, playerController.destroy);

module.exports = router;
