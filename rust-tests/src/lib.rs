use ethers::{
    prelude::*,
    providers::{Http, Provider},
    signers::LocalWallet,
};
use std::sync::Arc;
use std::env;
use dotenv::dotenv;
use anyhow::Result;

abigen!(
    FrameBreaker,
    "./artifacts/blockchain/contracts/FrameBreaker.sol/FrameBreaker.json"
);

async fn setup_contract() -> Result<Arc<FrameBreaker<Provider<Http>>>> {
    dotenv().ok();
    
    let provider = Provider::<Http>::try_from(
        env::var("MONAD_TESTNET_URL").unwrap_or_else(|_| "http://localhost:8545".to_string())
    )?;
    
    let wallet: LocalWallet = env::var("PRIVATE_KEY")
        .expect("No private key set")
        .parse()?;
    
    let client = SignerMiddleware::new(provider, wallet);
    let client = Arc::new(client);
    
    let contract_addr: Address = env::var("CONTRACT_ADDRESS")
        .expect("No contract address set")
        .parse()?;
    
    Ok(Arc::new(FrameBreaker::new(contract_addr, client)))
}

#[tokio::test]
async fn test_submit_score() -> Result<()> {
    let contract = setup_contract().await?;
    
    // Submit a score
    let tx = contract
        .submit_score("RustTest".to_string(), U256::from(1000))
        .value(U256::from(10000000000000000u64)) // 0.01 ETH
        .send()
        .await?;
    
    tx.await?;
    
    // Get the leaderboard
    let scores = contract.get_leaderboard(U256::from(1)).call().await?;
    assert_eq!(scores.len(), 1);
    assert_eq!(scores[0].score, U256::from(1000));
    
    Ok(())
}

#[tokio::test]
async fn test_deployment_validation() -> Result<()> {
    let contract = setup_contract().await?;
    
    // Validate initial state
    let stats = contract.get_stats().call().await?;
    assert_eq!(stats.0, U256::zero()); // total_submissions
    assert_eq!(stats.1, U256::from(10000000000000000u64)); // submission_fee (0.01 ETH)
    assert_eq!(stats.2, U256::zero()); // contract_balance
    
    Ok(())
}

#[tokio::test]
async fn test_network_specific_features() -> Result<()> {
    let contract = setup_contract().await?;
    
    // Test network-specific features
    let provider = contract.client().provider();
    let network = provider.get_network().await?;
    
    // Adjust expectations based on network
    let expected_fee = if network.chain_id() == 1337 { // Monad testnet
        U256::from(1000000000000000u64) // 0.001 ETH
    } else {
        U256::from(10000000000000000u64) // 0.01 ETH
    };
    
    let actual_fee = contract.submission_fee().call().await?;
    assert_eq!(actual_fee, expected_fee);
    
    Ok(())
}