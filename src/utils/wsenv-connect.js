import config from '../config';
import Axios from 'axios';

export const wsenvApiClient = (() => {
  const client = Axios.create();
  return client;
})();

export const getWsenvConnection = async () => {};
