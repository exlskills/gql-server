import express from 'express';
import { logger } from '../utils/logger';
import { ServerError } from '../helpers/server';
import { stringify } from 'flatted/cjs';
import { loadCourseDeliverySchedule } from '../data-load/course-delivery-schedule/load-api-handler';

const router = express.Router();

router.post('/', async (req, res) => {
  logger.debug(`in post course-delivery-schedule`);

  try {
    // logger.debug(` request ` + stringify(req));
    const result = await loadCourseDeliverySchedule(
      req.body,
      req.get('X-Hub-Signature')
    );
    logger.debug(`result ` + JSON.stringify(result));
    if (
      result.status &&
      [304, 400, 403, 422, 500].indexOf(result.status) > -1
    ) {
      logger.debug(`return with status ` + result.status);
      return res.status(result.status).json(result);
    } else {
      res.json(
        result || {
          status: 'OK'
        }
      );
      // TODO - change to return upon call initial validation and send detailed status to the GitHub user's email
      logger.debug(`return with default status `);
      return res;
    }
  } catch (error) {
    logger.error(`uncaught error ` + error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

router.use((err, req, res, _next) => {
  // Expected errors always throw ServerError.
  // Unexpected errors will either throw unexpected stuff or crash the application.
  if (Object.prototype.isPrototypeOf.call(ServerError.prototype, err)) {
    return res.status(err.status || 500).json({
      error: err.message
    });
  }

  logger.error('~~~ Unexpected error exception start ~~~');
  logger.error(err);
  logger.error(err.stack);
  logger.error('~~~ Unexpected error exception end ~~~');

  return res.status(500).json({
    error: 'Internal server error'
  });
});

export default router;
