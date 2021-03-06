import jwt from 'jsonwebtoken';
import { jwtpublic_key } from '.././config';
import { logger } from '../utils/logger';

export const loginRequired = (req, res, next) => {
  logger.debug(`in loginReqired`);
  if (req.gqlviewer) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const getViewer = (req, res, next) => {
  logger.debug(`in getViewer`);
  if (req.cookies.token) {
    let decoded = null;
    try {
      decoded = jwt.verify(req.cookies.token, jwtpublic_key, {
        algorithm: 'RS256'
      });
    } catch (err) {
      logger.error(`jwt verify error ` + err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.gqlviewer = {
      user_id: decoded.user_id,
      locale: decoded.locale
    };
  }

  if (req.gqlviewer) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
