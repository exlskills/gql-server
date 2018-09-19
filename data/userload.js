import mongoose from 'mongoose';
import * as fs from 'fs-extra';
import path from 'path';
import * as yaml from 'js-yaml';
import User from './user-base';

async function loadUsers() {
  try {
    const fileToRead = path.join(__dirname, 'user.yaml');
    const fileContents = await fs.readFile(fileToRead);
    console.log(fileContents);
    const parsed = yaml.safeLoad(fileContents);
    console.log(`parsed ` + JSON.stringify(parsed));

    let promises = [];
    for (let user of parsed) {
      console.log(`user ` + JSON.stringify(user));
      promises.push(User.create(user));
    }
    const dothis = await Promise.all(promises);
    console.log('Ok ');
  } catch (err) {
    console.log('error ' + err);
    //return Promise.reject(err);
  }
}

doWork();

async function doWork() {
  await mongoose.connect('mongodb://localhost:27017/webph2_dev');
  console.log('db connected');

  mongoose.set('debug', true);

  const res = await loadUsers();

  console.log('done');
  closeConnection();
}

const closeConnection = () => {
  mongoose.connection.close(() => {
    console.log('Done, mongoose connection disconnected.');
  });
};
