import Agenda from 'agenda';
import config from '../config';
import { logger } from '../utils/logger';
import { processCloseExamSession } from './close-exam-sessions';

export const agenda = new Agenda({
  db: {
    address: config.mongo.uri + '/' + config.mongo.db,
    collection: 'agenda-jobs',
    options: { useNewUrlParser: true }
  }
});

agenda.on('ready', async function() {
  agenda.processEvery('30 seconds');
  await agenda.start();
  logger.info(`Agenda started`);
});

agenda.define('closeExamSession', async (job, done) => {
  logger.debug(`In agenda define closeExamSession`);
  logger.debug(`  job.attrs ` + JSON.stringify(job.attrs));
  await processCloseExamSession(job.attrs.data.exam_session_id);
  await removeCompletedJobs();
  logger.debug(`in agenda after await`);
  // When you're all done, make sure to call the done() function at the very end to tell agenda you've finished this job.
  done();
});

async function removeCompletedJobs() {
  logger.debug(`in removeCompletedJobs`);
  await agenda.cancel({ nextRunAt: null, lastFinishedAt: { $ne: null } });
}

async function graceful() {
  logger.info(`Agenda stopping`);
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
