import Incident from '../db-models/incident-model';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';

export const recordIncident = async (user_id, incident_type, incident_desc) => {
  logger.debug(`in recordIncident`);
  try {
    const newIncidentObj = {
      user_id: user_id,
      incident_type: incident_type,
      incident_desc: incident_desc
    };
    // Timestamp is auto-added
    const incidentRecord = await Incident.create(newIncidentObj);
    return incidentRecord._id;
  } catch (err) {
    logger.error(
      `Record Incident failed with error ` +
        err +
        ` ; Doc object: ` +
        stringify(newIncidentObj)
    );
    return null;
  }
};
