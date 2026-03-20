import { Client } from 'node-osc';

const client = new Client('127.0.0.1', 53538);
const benchmark = 500;
let score = 400;

function sendScore() {
  const amounts = [100, 200];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];

  // Oscillate around the benchmark (500) so it crosses over and under
  let action;
  if (score + amount > 800) {
    action = 'subtract';
  } else if (score - amount < 300) {
    action = 'add';
  } else if (score >= benchmark) {
    // Above benchmark — bias towards subtract to bring it back down
    action = Math.random() > 0.3 ? 'subtract' : 'add';
  } else {
    // Below benchmark — bias towards add to bring it back up
    action = Math.random() > 0.3 ? 'add' : 'subtract';
  }

  const address = `/sound-check/score/${action}/${amount}`;

  if (action === 'add') {
    score += amount;
  } else {
    score -= amount;
  }

  const status = score >= benchmark ? '🟢 ABOVE' : '🔴 BELOW';
  client.send(address, () => {
    console.log(`[${action.toUpperCase()} ${amount}] Score: ${score} | Benchmark: ${benchmark} | ${status} | OSC: ${address}`);
  });
}

console.log(`Sending Sound Check score changes every 5s. Benchmark: ${benchmark}. Ctrl+C to stop.`);
console.log(`Starting score: ${score}`);
sendScore();
setInterval(sendScore, 5000);
