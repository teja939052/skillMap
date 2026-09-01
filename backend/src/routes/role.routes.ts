import { Router } from 'express';
import { CompetencyService } from '../services/competency.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { roleBlueprintSchema } from '@skill-map/contracts';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const orgId = req.query.orgId as string | undefined;
    const blueprints = await CompetencyService.listRoleBlueprints(orgId);
    sendSuccess(res, blueprints);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(roleBlueprintSchema), async (req, res, next) => {
  try {
    const result = await CompetencyService.createRoleBlueprint(req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const orgId = req.query.orgId as string | undefined;
    const blueprints = await CompetencyService.listRoleBlueprints(orgId);
    const blueprint = blueprints.find((b: any) => b.id === req.params.id);
    sendSuccess(res, blueprint);
  } catch (err) {
    next(err);
  }
});

export default router;
