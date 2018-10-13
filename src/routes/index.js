import express from 'express';
import { logger } from '../utils/logger';
import {
  ServerError,
  InternalServerError,
  BadRequestError
} from '../helpers/server';
import { parse, stringify } from 'flatted/cjs';
import { loadCourseDeliverySchedule } from '../data-load/course-delivery-schedule/load-api-handler';

const router = express.Router();

router.get('/', (req, res) => {
  logger.debug(`in root router`);
  res.json(
    'pong' || {
      status: 'OK'
    }
  );
});

router.post('/course-delivery-schedule', async (req, res) => {
  logger.debug(`in post course-delivery-schedule`);

  try {
    logger.debug(stringify(req));
    const result = await loadCourseDeliverySchedule(
      req.body,
      req.get('X-Hub-Signature')
    );
    logger.error(`result ` + JSON.stringify(result));
    if (
      result.status &&
      [304, 400, 403, 404, 422, 500].indexOf(result.status) > -1
    ) {
      return res.status(result.status).json(result);
    } else {
      res.json(
        result || {
          status: 'OK'
        }
      );
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
  logger.error('~~~ Unexpected error exception end ~~~');

  return res.status(500).json({
    error: 'Internal server error'
  });
});

export default router;
