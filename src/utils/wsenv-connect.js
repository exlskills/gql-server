import config from '../config';
import Axios from 'axios';
import { logger } from '../utils/logger';

const wsenvApiClient = () => {
  logger.debug(`In getApiClient`);
  return Axios.create();
};

export const getWsenvGradingClient = async () => {
  logger.debug(`In getWsenvGradingClient`);
  try {
    const wsenvConnection = await wsenvApiClient.get(
      config.wsenv_signalling_url
    );
    logger.debug(`wsenv con ` + wsenvConnection.data.grading_endpoint);
    const wsenvGradingClient = Axios.create({
      baseURL: wsenvConnection.data.grading_endpoint
    });
    return wsenvConnection.data.grading_endpoint;
  } catch (err) {
    return Promise.reject(new Error(err));
  }
};

export const callWsenvGrading = async (endpointUrl, jsonBody) => {
  logger.debug(`In callWsenvGrading`);
  try {
    logger.debug(`load ` + JSON.stringify(jsonBody));
    const gradingResponse = await Axios.post(endpointUrl, jsonBody);
    logger.debug(`resp ` + JSON.stringify(gradingResponse.data));
    return gradingResponse;
  } catch (err) {
    logger.debug(err.response);
    return Promise.reject(new Error(err));
  }
};
