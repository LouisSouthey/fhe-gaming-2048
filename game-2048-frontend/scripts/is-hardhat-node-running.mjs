import http from 'http';

function checkHardhatNode() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8545,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1,
    }));
    req.end();
  });
}

async function main() {
  const isRunning = await checkHardhatNode();
  
  if (!isRunning) {
    console.error('\n===================================================================');
    console.error('ERROR: Hardhat node is not running on localhost:8545');
    console.error('===================================================================');
    console.error('\nPlease start the Hardhat node first:');
    console.error('\n  1. Open a new terminal');
    console.error('  2. cd fhevm-hardhat-template');
    console.error('  3. npx hardhat node');
    console.error('\nThen try running this command again.');
    console.error('===================================================================\n');
    process.exit(1);
  }
  
  console.log('✓ Hardhat node is running on localhost:8545');
}

main();

