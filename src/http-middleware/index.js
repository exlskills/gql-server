import jwt from 'jsonwebtoken';
import { jwtpublic_key } from '.././config';

export const loginRequired = (req, res, next) => {
  if (req.gqlviewer) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const getViewer = (req, res, next) => {
  if (req.cookies.token) {
    const decoded = jwt.verify(req.cookies.token, jwtpublic_key, {
      algorithm: 'RS256'
    });
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
