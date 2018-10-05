import config from '../../../src/config';
import { logger } from '../../../src/utils/logger';
import CircularJSON from 'circular-json';

const octokit = require('@octokit/rest')();

export const loadCourseDeliverySchedule = async githubEvent => {
  logger.debug(`in loadCourseDeliverySchedule`);
  logger.debug(`repository ` + JSON.stringify(githubEvent.repository));

  if (githubEvent && githubEvent.commits) {
    const filesToProcess = githubEvent.commits.reduce(function(agg, commit) {
      if (commit.message && !commit.message.includes('auto#gen')) {
        agg = agg.concat(commit.added).concat(commit.modified);
        //.concat(commit.removed)
        //.filter(file => file.indexOf("src/js/jet-composites/input-country") > -1)
      }
      return agg;
    }, []);

    logger.debug(`filesToProcess ` + filesToProcess);

    var github = {
      owner: config.github_user,
      repo: githubEvent.repository.name,
      branch: 'master'
    };

    logger.debug(`owner ` + githubEvent.repository.owner.name);
    logger.debug(`repo ` + githubEvent.repository.name);

    logger.debug(`ref ` + githubEvent.ref);

    logger.debug(`ftp ` + filesToProcess.length);

    for (let fileToProcess of filesToProcess) {
      logger.debug(`path ` + fileToProcess);
      const fileFromRepo = await octokit.repos.getContent({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        path: fileToProcess,
        ref: githubEvent.ref
      });

      logger.debug(CircularJSON.stringify(fileFromRepo));

      if (fileFromRepo.data.type === 'file') {
        logger.debug(`file_sha ` + fileFromRepo.data.sha);
        const fileContent = await octokit.gitdata.getBlob({
          owner: githubEvent.repository.owner.name,
          repo: githubEvent.repository.name,
          file_sha: fileFromRepo.data.sha
        });
        logger.debug(CircularJSON.stringify(fileContent));
        logger.debug(
          Buffer.from(fileContent.data.content, 'base64').toString('utf8')
        );
      }
    }
  }
  return 'Ok';
};
