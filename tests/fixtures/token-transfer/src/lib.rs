#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env};

#[contract]
pub struct Transfer;

#[contractimpl]
impl Transfer {
    pub fn transfer(env: Env, asset: Address, from: Address, to: Address, amount: i128) {
        let token = token::Client::new(&env, &asset);
        #[cfg(feature = "redundant-balance-reads")]
        for _ in 0..12 {
            assert!(token.balance(&from) >= amount);
        }
        token.transfer(&from, &to, &amount);
    }
}
