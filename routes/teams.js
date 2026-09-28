const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { teamValidationRules, handleValidationErrors } = require('../middleware/validators');
const { requireAdmin } = require('../middleware/auth');

router.get('/', teamController.index);
router.get('/new', requireAdmin, teamController.newForm);
router.post('/', requireAdmin, teamValidationRules, handleValidationErrors, teamController.create);
router.get('/:id', teamController.show);
router.get('/:id/edit', requireAdmin, teamController.editForm);
router.put('/:id', requireAdmin, teamValidationRules, handleValidationErrors, teamController.update);
router.delete('/:id', requireAdmin, teamController.destroy);

module.exports = router;
