# VeilPay Test Wallets

These wallets are for **devnet testing only**. Do NOT use these on mainnet.

## Usage

1. Copy a wallet's secret key to your localStorage:
   ```js
   localStorage.setItem('veilpay_test_wallet', JSON.stringify([...secretKey]))
   ```

2. Set `VITE_USE_TEST_WALLET=true` in your `.env.local`

3. The app will use this wallet for real devnet interactions

## Wallets

- **test-wallet-1**: `A8zQBb1pJECz2r8HHguG7qkvgJaZLXXY6qpzv1HZo2in`
- **test-wallet-2**: `Fpy4JFUvcTcL3ug9PceqhQPHLbLZLpyq8E4czeQPaJTF`
- **test-wallet-3**: `2DqmeEPifMoaRzd5oWobAw9UHUuQEp8zhvPMwgcMK2sB`
- **test-wallet-4**: `AoFoA1AuudQ91w4KvokqQkamgsVB218Dm1iLW5aJ6isH`
- **test-wallet-5**: `91o8RVVbrZk5UyGWJnzZuPjYkYY6ujVrtkJUaRWJ9ZWw`

## Security Warning

These wallets are generated deterministically for testing. They have NO real funds.
Fund them via the [Solana Faucet](https://faucet.solana.com/) before use.
