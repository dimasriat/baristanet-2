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
  const privateKey = await ask('Sequencer private key: ');
  const sequencer = new ethers.Wallet(privateKey);
  const solver = await ask('Solver address: ');
  const contractAddress = await ask('BrewHouse / LattePool address: ');

  const action = await ask('Action (borrow / repay / withdraw): ');
  const amountStr = await ask('Amount in ETH: ');
  const amount = ethers.utils.parseEther(amountStr);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  if (action === 'withdraw') {
    const rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'address'],
      [solver, amount, deadline, contractAddress],
    );
    const ethSignedMessage = ethers.utils.hashMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const signature = await sequencer.signMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const { r, s, v } = ethers.utils.splitSignature(signature);

    console.log('\n✅ Signature Result:');
    console.log('Action:', action);
    console.log('Amount ETH in Wei:', amount.toString());
    console.log('Deadline:', deadline);
    console.log('Raw Message:', rawMessage);
    console.log('Eth Signed Hash:', ethSignedMessage);
    console.log('Signature:', signature);
    console.log('r:', r);
    console.log('s:', s);
    console.log('v:', v);
  }

  if (action === 'borrow') {
    const maxDebtInEth = await ask('Max Debt Allowed in ETH: ');
    const maxDebt = ethers.utils.parseEther(maxDebtInEth);
    const rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [solver, amount, maxDebt, deadline, contractAddress],
    );
    const ethSignedMessage = ethers.utils.hashMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const signature = await sequencer.signMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const { r, s, v } = ethers.utils.splitSignature(signature);

    console.log('\n✅ Signature Result:');
    console.log('Action:', action);
    console.log('Amount ETH in Wei:', amount.toString());
    console.log('Max Debt Allowed in Wei:', maxDebt.toString());
    console.log('Deadline:', deadline);
    console.log('Raw Message:', rawMessage);
    console.log('Eth Signed Hash:', ethSignedMessage);
    console.log('Signature:', signature);
    console.log('r:', r);
    console.log('s:', s);
    console.log('v:', v);
  }

  if (action === 'repay') {
    const currentDebtInEth = await ask('Current Debt in ETH: ');
    const currentDebt = ethers.utils.parseEther(currentDebtInEth);
    const rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [solver, amount, currentDebt, deadline, contractAddress],
    );
    const ethSignedMessage = ethers.utils.hashMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const signature = await sequencer.signMessage(
      ethers.utils.arrayify(rawMessage),
    );
    const { r, s, v } = ethers.utils.splitSignature(signature);

    console.log('\n✅ Signature Result:');
    console.log('Action:', action);
    console.log('Amount ETH in Wei:', amount.toString());
    console.log('Current Debt in Wei:', currentDebt.toString());
    console.log('Deadline:', deadline);
    console.log('Raw Message:', rawMessage);
    console.log('Eth Signed Hash:', ethSignedMessage);
    console.log('Signature:', signature);
    console.log('r:', r);
    console.log('s:', s);
    console.log('v:', v);
  }

  rl.close();
}

async function mainBackup() {
  console.log('🔐 Sequencer Signature Generator');

  const action = await ask('Action (borrow / repay / withdraw): ');
  const privateKey = await ask('Sequencer private key: ');
  const wallet = new ethers.Wallet(privateKey);

  const user = await ask('Solver address: ');
  const amountStr = await ask('Amount in ETH: ');
  const amount = ethers.utils.parseEther(amountStr);

  let maxDebt = 0;
  let currentDebt = 0;

  if (action === 'borrow') {
    maxDebt = await ask('Max Debt Allowed in ETH: ');
    // extraParam = ethers.utils.parseEther(maxDebt);
  } else if (action === 'repay') {
    currentDebt = await ask('Current Debt in ETH: ');
    // extraParam = ethers.utils.parseEther(currentDebt);
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
  }

  if (action === 'borrow') {
    // Construct raw message
    rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [
        user,
        amount,
        deadline,
        ethers.utils.parseEther(maxDebt),
        contractAddress,
      ],
    );
  }

  if (action === 'repay') {
    // Construct raw message
    rawMessage = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [
        user,
        amount,
        deadline,
        ethers.utils.parseEther(currentDebt),
        contractAddress,
      ],
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
