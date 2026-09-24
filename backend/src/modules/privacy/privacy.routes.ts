import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { privacyController } from './privacy.controller';
import {
  createIncidentSchema,
  createPrivacyRequestSchema,
  listAuditSchema,
  listPrivacyRequestsSchema,
  privacyIdParamsSchema,
  updateIncidentSchema,
  updatePrivacyContactSchema,
  updatePrivacyRequestSchema,
  updateRetentionPolicySchema,
} from './privacy.schema';

const router = Router();

router.use(authenticate);

router.get('/privacy/export', privacyController.export.bind(privacyController));
router.get('/privacy/contact', privacyController.contact.bind(privacyController));
router.post(
  '/privacy/requests',
  validate(createPrivacyRequestSchema),
  privacyController.createRequest.bind(privacyController)
);
router.get('/privacy/requests/me', privacyController.listMine.bind(privacyController));

router.patch(
  '/admin/privacy/contact',
  requireAdmin,
  validate(updatePrivacyContactSchema),
  privacyController.updateContact.bind(privacyController)
);

router.get(
  '/admin/privacy/requests',
  requireAdmin,
  validate(listPrivacyRequestsSchema, 'query'),
  privacyController.listRequests.bind(privacyController)
);
router.get(
  '/admin/privacy/requests/:id',
  requireAdmin,
  validate(privacyIdParamsSchema, 'params'),
  privacyController.getRequest.bind(privacyController)
);
router.patch(
  '/admin/privacy/requests/:id',
  requireAdmin,
  validate(privacyIdParamsSchema, 'params'),
  validate(updatePrivacyRequestSchema),
  privacyController.updateRequest.bind(privacyController)
);
router.get(
  '/admin/privacy/audit',
  requireAdmin,
  validate(listAuditSchema, 'query'),
  privacyController.audit.bind(privacyController)
);
router.get(
  '/admin/privacy/retention',
  requireAdmin,
  privacyController.retention.bind(privacyController)
);
router.patch(
  '/admin/privacy/retention',
  requireAdmin,
  validate(updateRetentionPolicySchema),
  privacyController.updateRetention.bind(privacyController)
);
router.get(
  '/admin/privacy/retention/report',
  requireAdmin,
  privacyController.retentionReport.bind(privacyController)
);
router.get(
  '/admin/privacy/incidents',
  requireAdmin,
  privacyController.listIncidents.bind(privacyController)
);
router.post(
  '/admin/privacy/incidents',
  requireAdmin,
  validate(createIncidentSchema),
  privacyController.createIncident.bind(privacyController)
);
router.patch(
  '/admin/privacy/incidents/:id',
  requireAdmin,
  validate(privacyIdParamsSchema, 'params'),
  validate(updateIncidentSchema),
  privacyController.updateIncident.bind(privacyController)
);

export default router;
