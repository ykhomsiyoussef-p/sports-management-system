const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { coachValidationRules, handleValidationErrors } = require('../middleware/validators');
const { requireAdmin } = require('../middleware/auth');

router.get('/', coachController.index);
router.get('/new', requireAdmin, coachController.newForm);
router.post('/', requireAdmin, coachValidationRules, handleValidationErrors, coachController.create);
router.get('/:id/edit', requireAdmin, coachController.editForm);
router.put('/:id', requireAdmin, coachValidationRules, handleValidationErrors, coachController.update);
router.delete('/:id', requireAdmin, coachController.destroy);

module.exports = router;
