#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

#[contract]
pub struct TemporaryTtlContract;

#[contractimpl]
impl TemporaryTtlContract {
    pub fn write(env: Env, value: u32) -> u32 {
        let key: Symbol = symbol_short!("temp");
        env.storage().temporary().set(&key, &value);
        value
    }

    pub fn read(env: Env) -> u32 {
        let key: Symbol = symbol_short!("temp");
        env.storage().temporary().get(&key).unwrap_or(0)
    }
}
