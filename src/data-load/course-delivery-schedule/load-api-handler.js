import config from '../../config/index';
import { logger } from '../../utils/logger';
import { parse, stringify } from 'flatted/cjs';
import { loadData } from './course-delivery-schedule-load';
import verifyGithubWebhook from 'verify-github-webhook';

const Octokit = require('@octokit/rest');

export const loadCourseDeliverySchedule = async (
  githubEvent,
  xhubSignature
) => {
  logger.debug(`in loadCourseDeliverySchedule`);

  //logger.debug(`xhubSignature ` + xhubSignature);
  //logger.debug(`githubEvent ` + stringify(githubEvent));

  const result = { files_processed: [] };
  let errorInProcess = false;

  if (!(githubEvent && githubEvent.repository)) {
    result.status = 400;
    result.msg = 'Empty request body or repository object';
    return result;
  }

  if (config.github_wh_token) {
    if (!xhubSignature) {
      result.status = 400;
      result.msg = 'Missing X-Hub-Signature in request header';
      return result;
    }
    let jsonBody;
    try {
      jsonBody = JSON.stringify(githubEvent);
      logger.debug(` jsonBody ` + jsonBody);
    } catch (err) {
      result.status = 400;
      result.msg = 'Invalid request body';
      return result;
    }
    if (!verifyGithubWebhook(xhubSignature, jsonBody, config.github_wh_token)) {
      logger.error(`X-Hub-Signature does not match expected value`);
      result.status = 400;
      result.msg = 'X-Hub-Signature does not match expected value';
      return result;
    }
  }

  logger.debug(` body ref ` + githubEvent.ref);
  if (!githubEvent.ref || !githubEvent.ref.startsWith('refs/heads/')) {
    logger.error(`Invalid or missing ref: ` + githubEvent.ref);
    result.status = 400;
    result.msg = '`Invalid or missing ref: ` + githubEvent.ref';
    return result;
  }
  const hookBranch = githubEvent.ref.substring(11);
  logger.debug(`branch ` + hookBranch);
  try {
    const branches = config.ghWebhookBranch.split(',');
    if (!branches.includes(hookBranch)) {
      result.status = 304;
      result.msg = 'Branch is not on the list';
      return result;
    }
  } catch (err) {
    logger.error(`Failed checking branch against list ` + err);
    result.status = 304;
    result.msg = 'Branch is not on the list';
    return result;
  }

  let octokit;
  try {
    octokit = new Octokit({
      auth: 'token ' + config.github_user_token
    });
  } catch (err) {
    logger.error(`github user token auth error ` + err);
    result.status = 403;
    result.msg = 'GitHub user token authentication error';
    return result;
  }

  let fileBlobs = [];

  if (!(githubEvent && githubEvent.commits)) {
    result.status = 304;
    result.msg = 'No commits found in the payload';
    return result;
  }

  const filesToProcess = githubEvent.commits.reduce(function(agg, commit) {
    if (commit.message && !commit.message.includes('auto#gen')) {
      agg = agg
        .concat(commit.added)
        .concat(commit.modified)
        //.concat(commit.removed)
        .filter(
          file =>
            !(
              file.toUpperCase().includes('README') ||
              file.toUpperCase().includes('LICENSE') ||
              file.includes('.gitignore')
            )
        );
    }
    return agg;
  }, []);
  logger.debug(`filesToProcess ` + filesToProcess);

  if (!(filesToProcess && filesToProcess.length > 0)) {
    logger.debug(`Bypassing the call - nothing to process `);
    result.status = 304;
    result.msg = 'No Schedule files to process found in the commits';
    return result;
  }

  for (let fileToProcess of filesToProcess) {
    logger.debug(`path ` + fileToProcess);

    const fileFromRepo = await octokit.repos.getContents({
      owner: githubEvent.repository.owner.name,
      repo: githubEvent.repository.name,
      path: fileToProcess,
      ref: githubEvent.ref
    });
    logger.debug(`fileFromRepo ` + stringify(fileFromRepo));

    if (fileFromRepo.data.type === 'file') {
      // This would always be the case for regular text files
      logger.debug(`file_sha ` + fileFromRepo.data.sha);

      const fileReplyObj = {
        name: fileToProcess
      };

      let fileContentObj;
      try {
        fileContentObj = await octokit.git.getBlob({
          owner: githubEvent.repository.owner.name,
          repo: githubEvent.repository.name,
          file_sha: fileFromRepo.data.sha
        });
        logger.debug(`fileContentObj ` + stringify(fileContentObj));
      } catch (err) {
        logger.error(JSON.stringify(fileContentObj));
        fileReplyObj.completed = 'error';
        fileReplyObj.error = 'Failed pulling file from GitHub';
        result.files_processed.push({
          fileReplyObj
        });
        errorInProcess = true;
        continue;
      }

      let fileContentString = Buffer.from(
        fileContentObj.data.content,
        'base64'
      ).toString('utf8');
      logger.debug(`fileContentString ` + fileContentString);

      try {
        fileContentString = await loadData(fileContentString);
      } catch (err) {
        fileReplyObj.completed = 'error';
        fileReplyObj.error = 'Loader error: ' + err;
        result.files_processed.push({
          fileReplyObj
        });
        logger.error(JSON.stringify(fileReplyObj));
        errorInProcess = true;
        continue;
      }

      if (fileContentString) {
        try {
          const fileNewContentBase64 = Buffer(fileContentString).toString(
            'base64'
          );
          const fileBlobSha = await octokit.git.createBlob({
            owner: githubEvent.repository.owner.name,
            repo: githubEvent.repository.name,
            content: fileNewContentBase64,
            encoding: 'base64'
          });
          logger.debug(`fileBlobSha ` + stringify(fileBlobSha));

          const fileBlob = {
            path: fileToProcess,
            mode: '100644',
            type: 'blob',
            sha: fileBlobSha.data.sha
          };
          fileBlobs.push(fileBlob);
          fileReplyObj.completed = 'ok';
        } catch (err) {
          logger.error('fileBlob creation error: ' + err);
          fileReplyObj.completed = 'error';
          fileReplyObj.error = 'fileBlob creation error: ' + err;
          errorInProcess = true;
        }
        result.files_processed.push({
          fileReplyObj
        });
      }
    }
  } // END OF loop on Files

  if (fileBlobs.length > 0) {
    try {
      const latestReference = await octokit.git.getRef({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        ref: githubEvent.ref.substring('refs/'.length)
      });
      logger.debug(`latestReference ` + stringify(latestReference));

      const latestCommit = await octokit.git.getCommit({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        commit_sha: latestReference.data.object.sha
      });
      logger.debug(`latestCommit ` + stringify(latestCommit));

      const newTree = await octokit.git.createTree({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        tree: fileBlobs,
        base_tree: latestCommit.data.tree.sha
      });
      logger.debug(`newTree ` + stringify(newTree));

      const newCommit = await octokit.git.createCommit({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        message: 'auto#gen by ' + latestCommit.data.sha,
        tree: newTree.data.sha,
        parents: [latestCommit.data.sha]
      });
      logger.debug(`newCommit ` + stringify(newCommit));

      const result = await octokit.git.updateRef({
        owner: githubEvent.repository.owner.name,
        repo: githubEvent.repository.name,
        ref: githubEvent.ref.substring('refs/'.length),
        sha: newCommit.data.sha
      });
      logger.debug(`result ` + stringify(result));
    } catch (err) {
      logger.error('GitHub commit flow error ' + err);
      result.msg = 'Commit process failed';
      errorInProcess = true;
    }
  } else {
    if (errorInProcess) {
      result.status = 422;
    }
    result.msg = 'No updates to commit';
  }

  return result;
};
