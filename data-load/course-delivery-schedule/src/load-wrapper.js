import config from '../../../src/config';
import { logger } from '../../../src/utils/logger';
import CircularJSON from 'circular-json';

const octokit = require('@octokit/rest')();

export const loadCourseDeliverySchedule = async githubEvent => {
  logger.debug(`in loadCourseDeliverySchedule`);
  logger.debug(`repository ` + JSON.stringify(githubEvent.repository));

  octokit.authenticate({
    type: 'token',
    token: config.github_token
  });

  let fileBlobs = [];

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

    for (let fileToProcess of filesToProcess) {
      logger.debug(`path ` + fileToProcess);

      const fileFromRepo = await octokit.repos.getContent({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        path: fileToProcess,
        ref: githubEvent.ref
      });
      logger.debug(`fileFromRepo` + CircularJSON.stringify(fileFromRepo));

      if (fileFromRepo.data.type === 'file') {
        logger.debug(`file_sha ` + fileFromRepo.data.sha);

        const fileContentObj = await octokit.gitdata.getBlob({
          owner: githubEvent.repository.owner.name,
          repo: githubEvent.repository.name,
          file_sha: fileFromRepo.data.sha
        });
        logger.debug(CircularJSON.stringify(fileContentObj));
        logger.debug(
          Buffer.from(fileContentObj.data.content, 'base64').toString('utf8')
        );

        let fileContentString = Buffer.from(
          fileContentObj.data.content,
          'base64'
        ).toString('utf8');

        fileContentString += 'qqqwww';
        logger.debug(`fileContentString ` + fileContentString);

        const fileNewContentBase64 = Buffer(fileContentString).toString(
          'base64'
        );

        const fileBlobSha = await octokit.gitdata.createBlob({
          owner: githubEvent.repository.owner.name,
          repo: githubEvent.repository.name,
          content: fileNewContentBase64,
          encoding: 'base64'
        });
        logger.debug(`fileBlobSha ` + CircularJSON.stringify(fileBlobSha));

        const fileBlob = {
          path: fileToProcess,
          mode: '100644',
          type: 'blob',
          sha: fileBlobSha.data.sha
        };

        fileBlobs.push(fileBlob);
      }
    }
  }

  if (fileBlobs.length > 0) {
    const latestReference = await octokit.gitdata.getReference({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      ref: githubEvent.ref.substring('refs/'.length)
    });
    logger.debug(`latestReference ` + CircularJSON.stringify(latestReference));

    const latestCommit = await octokit.gitdata.getCommit({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      commit_sha: latestReference.data.object.sha
    });
    logger.debug(`latestCommit ` + CircularJSON.stringify(latestCommit));

    const newTree = await octokit.gitdata.createTree({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      tree: fileBlobs,
      base_tree: latestCommit.data.tree.sha
    });
    logger.debug(`newTree ` + CircularJSON.stringify(newTree));

    const newCommit = await octokit.gitdata.createCommit({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      message: 'auto#gen01',
      tree: newTree.data.sha,
      parents: [latestCommit.data.sha]
    });
    logger.debug(`newCommit ` + CircularJSON.stringify(newCommit));

    const result = await octokit.gitdata.updateReference({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      ref: githubEvent.ref.substring('refs/'.length),
      sha: newCommit.data.sha
    });
    logger.debug(`result ` + CircularJSON.stringify(result));

  }

  return 'Ok';
};
