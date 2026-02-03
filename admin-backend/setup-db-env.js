#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(q, hide = false) {
  return new Promise((resolve) => {
    if (!hide) return rl.question(q, resolve);

    // Hide input (for password)
    const stdin = process.openStdin();
    process.stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(q + Array(rl.line.length + 1).join('*'));
          break;
      }
    });

    rl.question(q, (answer) => {
      resolve(answer);
    });
  });
}

async function run() {
  try {
    const defaultHost = 'localhost';
    const defaultPort = '3306';
    const defaultName = 'transl_web_tiper';
    const defaultUser = 'root';

    const host = (await question(`DB_HOST (${defaultHost}): `)) || defaultHost;
    const port = (await question(`DB_PORT (${defaultPort}): `)) || defaultPort;
    const name = (await question(`DB_NAME (${defaultName}): `)) || defaultName;
    const user = (await question(`DB_USER (${defaultUser}): `)) || defaultUser;
    const password = await question('DB_PASSWORD (leave blank for none): ', true);

    const content = `DB_HOST=${host}\nDB_NAME=${name}\nDB_USER=${user}\nDB_PASSWORD=${password}\nDB_PORT=${port}\nPORT=4000\n`;

    fs.writeFileSync(envPath, content, { mode: 0o600 });
    console.log('\nCreated .env in admin-backend/.env');
    console.log('Run `npm start` to start the server.');
  } catch (err) {
    console.error('Failed to write .env:', err);
  } finally {
    rl.close();
  }
}

run();
