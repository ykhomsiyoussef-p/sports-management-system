const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { coachValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/', coachController.index);
router.get('/new', coachController.newForm);
router.post('/', coachValidationRules, handleValidationErrors, coachController.create);
router.get('/:id/edit', coachController.editForm);
router.put('/:id', coachValidationRules, handleValidationErrors, coachController.update);
router.delete('/:id', coachController.destroy);

module.exports = router;
