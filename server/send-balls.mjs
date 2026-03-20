import { Client } from 'node-osc';

const client = new Client('127.0.0.1', 8001);
const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

// Shuffle
for (let i = numbers.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
}

let index = 0;

function sendNext() {
  if (index >= 90) {
    console.log('All 90 called — sending reset...');
    client.send('/brbingo/reset', () => {
      console.log('Reset sent. Starting new round in 5s...');
      // Reshuffle
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      index = 0;
      setTimeout(sendNext, 5000);
    });
    return;
  }

  const num = numbers[index];
  client.send('/brbingo/number', num, () => {
    console.log(`[${index + 1}/90] Ball: ${num}`);
    index++;
    setTimeout(sendNext, 5000);
  });
}

console.log('Sending bingo balls every 5s. Reset at 90. Ctrl+C to stop.');
sendNext();
