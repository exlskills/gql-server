import { fetchVersionedContentById } from '../db-handlers/versioned-content/versioned-content-fetch';

export const getOneVersionedContentRecord = (args, viewer, info) =>
  getOneVersionedContentRecordWorker(args, viewer, info).then(res => {
    if (res && res.length > 0) {
      return res[0];
    } else {
      return { _id: '', version: 0, content: '' };
    }
  });

const getOneVersionedContentRecordWorker = async (args, viewer, info) => {
  let version = 0;
  if (args.version) {
    version = parseInt(args.version);
    if (!version) {
      return Promise.reject('Invalid version');
    }
  }

  try {
    return await fetchVersionedContentById(
      args.content_id,
      version,
      viewer.locale
    );
  } catch (err) {
    return Promise.reject(err);
  }
};
