#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct RandomContract;

#[contractimpl]
impl RandomContract {
    /// Bounded PRNG-dependent case: draw at most four privacy-free u64 values.
    /// The bound keeps resource consumption finite; the values still depend on
    /// the host seed, so recording-mode native replay and RPC simulation differ.
    pub fn draws(env: Env, count: u32) -> Vec<u64> {
        let mut prng = env.prng();
        let bounded = if count > 4 { 4 } else { count };
        let mut out = vec![&env];
        let mut index = 0u32;
        while index < bounded {
            out.push_back(prng.gen::<u64>());
            index += 1;
        }
        out
    }

    /// Deterministic control: the same contract with no PRNG dependency.
    pub fn constant(_env: Env) -> Symbol {
        symbol_short!("fixed")
    }
}
