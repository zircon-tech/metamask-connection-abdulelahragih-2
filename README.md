# DecentralizedWill - Digital Inheritance dApp 🚀

## What's this project about?

This is a decentralized application (dApp) that allows users to create digital wills on the blockchain using smart contracts. Users can set up inheritance plans that automatically transfer their assets to beneficiaries if they become inactive for a specified period.

### Key Features

- **Digital Will Creation**: Create wills with specified beneficiaries and inactivity periods
- **Heartbeat System**: Send periodic "heartbeats" to keep your will active
- **Automatic Inheritance**: Beneficiaries can claim inheritance if the owner becomes inactive
- **MetaMask Integration**: Seamless wallet connection for blockchain interactions
- **Modern UI**: Built with React, Next.js, and TypeScript

### Smart Contract Features

- Create multiple wills with different beneficiaries
- Set custom inactivity periods
- Add funds to existing wills
- Automatic ETH transfer to beneficiaries upon claim
- Comprehensive will management and querying functions

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Ethereum (Sepolia testnet), Hardhat, Ethers.js
- **Wallet**: MetaMask integration
- **Development**: ESLint, Hardhat Ignition for deployments

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- Some test ETH on Sepolia network

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd metamask-connection-abdulelahragih-2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url_here
```

4. Deploy the smart contract:
```bash
npx hardhat ignition deploy ignition/modules/DecentralizedWill.ts --network sepolia
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Create Will**: 
   - Enter beneficiary address
   - Set inactivity period (in seconds)
   - Send ETH to fund the will
3. **Send Heartbeat**: Periodically send heartbeats to keep your will active
4. **Claim Inheritance**: Beneficiaries can claim if the owner becomes inactive

## Project Structure

```
├── contracts/           # Smart contracts
│   └── DecentralizedWill.sol
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── lib/           # Utility functions
├── ignition/          # Hardhat Ignition deployments
├── test/              # Test files
└── public/            # Static assets
```

## Smart Contract Functions

- `setWill(beneficiary, inactivityPeriod)` - Create a new will
- `heartbeat(willId)` - Send heartbeat to keep will active
- `claim(owner, willId)` - Claim inheritance as beneficiary
- `addToWill(willId)` - Add more funds to existing will
- `getWillDetails(owner, willId)` - Get will information
- `getAllWills(owner)` - Get all wills for an address

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Deployment

The contract is deployed on Sepolia testnet. Check the deployment addresses in `ignition/deployments/chain-11155111/deployed_addresses.json`.

## Resources

- [MetaMask Documentation](https://docs.metamask.io/guide/ethereum-provider.html#basic-usage)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Next.js Documentation](https://nextjs.org/docs)
