import { Client } from 'node-osc';

const client = new Client('127.0.0.1', 3003);

function send(address) {
  return new Promise(resolve => {
    client.send(address, () => {
      console.log(`OSC: ${address}`);
      resolve();
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetPresses(maxScore) {
  // Random bet: 2-6 presses of +10 (so 20-60), but capped at score
  const maxPresses = Math.min(6, Math.floor(maxScore / 10));
  return Math.max(2, Math.floor(Math.random() * maxPresses) + 1);
}

async function simulateRound(roundNum, team1Score, team2Score) {
  console.log(`\n=== ROUND ${roundNum} === (Blue: ${team1Score}, Red: ${team2Score})`);

  // Start round
  await send(`/std/round${roundNum}`);
  await wait(3000);

  // Team 1 bets
  const t1Presses = randomBetPresses(team1Score);
  for (let i = 0; i < t1Presses; i++) {
    await send('/std/team1/betup');
    await wait(400);
  }
  await wait(1000);

  // Team 2 bets
  const t2Presses = randomBetPresses(team2Score);
  for (let i = 0; i < t2Presses; i++) {
    await send('/std/team2/betup');
    await wait(400);
  }
  await wait(2000);

  // Lock bets
  await send('/std/team1/lock');
  await wait(1500);
  await send('/std/team2/lock');
  await wait(3000);

  // Decide winners/losers randomly - one wins, one loses
  const team1Wins = Math.random() > 0.5;

  if (team1Wins) {
    await send('/std/team1/correct');
    await wait(2000);
    await send('/std/team2/incorrect');
  } else {
    await send('/std/team2/correct');
    await wait(2000);
    await send('/std/team1/incorrect');
  }

  // Calculate new scores
  const t1Bet = t1Presses * 10;
  const t2Bet = t2Presses * 10;
  const newT1 = team1Wins ? team1Score + t1Bet : Math.max(0, team1Score - t1Bet);
  const newT2 = team1Wins ? Math.max(0, team2Score - t2Bet) : team2Score + t2Bet;

  console.log(`Result: ${team1Wins ? 'BLUE WINS' : 'RED WINS'} | Blue bet ${t1Bet}, Red bet ${t2Bet}`);
  console.log(`New scores: Blue ${newT1}, Red ${newT2}`);

  await wait(4000);

  return { team1Score: newT1, team2Score: newT2 };
}

async function runFullGame() {
  let t1 = 100;
  let t2 = 100;

  for (let round = 1; round <= 5; round++) {
    const result = await simulateRound(round, t1, t2);
    t1 = result.team1Score;
    t2 = result.team2Score;
  }

  console.log(`\n=== GAME OVER === Final: Blue ${t1}, Red ${t2}`);
  console.log(`Winner: ${t1 >= t2 ? 'BLUE' : 'RED'}`);
  await wait(6000);

  // Reset
  console.log('\n=== RESETTING ===');
  await send('/std/reset');
  await wait(5000);
}

console.log('Split the Difference simulator. Ctrl+C to stop.\n');

async function loop() {
  while (true) {
    await runFullGame();
  }
}

loop();
