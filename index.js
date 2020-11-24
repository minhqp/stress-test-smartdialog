const WebSocket = require('ws');
const snakeCase = require('snakecase-keys');
const camelCase = require('camelcase-keys');
const uuid = require('uuid');

console.log('APP_ID =', process.env.APP_ID);
console.log('DOMAIN =', process.env.DOMAIN);
console.log('TEST_CASES =', process.env.TEST_CASES);

const appId = process.env.APP_ID;
const domainChat = process.env.DOMAIN;
const numberOfTestCases = parseInt(process.env.TEST_CASES, 10);

const userSays = [...Array(numberOfTestCases).fill()].map((e, id) => ({ id, text: 'bắt đầu' }));
let counter = 0;

function sendMessage(client, msg) {
  client.send(JSON.stringify(msg, { deep: true }));
}

function requestBot(id, userSay) {
  const ws = new WebSocket(domainChat);
  
  ws.on('open', () => {
    sendMessage(ws, {
      type: 'INIT',
      appId,
    });
  });

  ws.on('message', async (data) => {
    let startTime = new Date();
    let endTime;

    const { type, status, accessToken, data: responseData } = camelCase(JSON.parse(data), { deep: true });

    switch (type) {
      case 'INIT': {
        sendMessage(ws, {
          type: 'CHAT',
          accessToken,
          message: {
            msgId: uuid.v4(),
            text: userSay,
          }
        })
        break;
      }

      case 'CHAT': {
        endTime = new Date();
        console.log('======================================================================');
        console.log({
          id,
          userSay,
          status,
          startTime,
          endTime,
          totalTime: +endTime - (+startTime),
          responseData,
        });
        counter += 1;
      }

      default:
        break;
    }
  });
}

for (const { id, text } of userSays) {
  requestBot(id, text);
}

const interval = setInterval(() => {
  console.log('+++++++++++++++++++++++++++++');
  console.log(counter);
  console.log('+++++++++++++++++++++++++++++');

  if (counter === numberOfTestCases) {
    clearInterval(interval);
  }
}, 1000);
