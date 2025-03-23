const { ethers } = require('ethers');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  console.log('🔐 Sequencer Signature Generator');

  const action = await ask('Action (borrow / repay / withdraw): ');
  const privateKey = await ask('Sequencer private key: ');
  const wallet = new ethers.Wallet(privateKey);

  const user = await ask('Solver address: ');
  const amountStr = await ask('Amount in ETH: ');
  const amount = ethers.utils.parseEther(amountStr);

  let extraParam = ethers.constants.Zero;
  if (action === 'borrow') {
    const maxDebt = await ask('Max Debt Allowed in ETH: ');
    extraParam = ethers.utils.parseEther(maxDebt);
  } else if (action === 'repay') {
    const currentDebt = await ask('Current Debt in ETH: ');
    extraParam = ethers.utils.parseEther(currentDebt);
  }

  const contractAddress = await ask('BrewHouse / LattePool address: ');
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  let rawMessage = '';

  if (action === 'withdraw') {
    // Construct raw message
    rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'address'],
      [user, amount, deadline, contractAddress],
    );
  } else {
    // Construct raw message
    rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [user, amount, extraParam, deadline, contractAddress],
    );
  }

  const ethSignedMessage = ethers.utils.hashMessage(
    ethers.utils.arrayify(rawMessage),
  );
  const signature = await wallet.signMessage(ethers.utils.arrayify(rawMessage));
  const { r, s, v } = ethers.utils.splitSignature(signature);

  console.log('\n✅ Signature Result:');
  console.log('Action:', action);
  console.log('Deadline:', deadline);
  console.log('Raw Message:', rawMessage);
  console.log('Eth Signed Hash:', ethSignedMessage);
  console.log('Signature:', signature);
  console.log('r:', r);
  console.log('s:', s);
  console.log('v:', v);

  rl.close();
}

main();
