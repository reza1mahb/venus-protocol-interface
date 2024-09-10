import { ChainId } from 'types';

export const LAYER_ZERO_CHAIN_IDS: Record<ChainId, number> = {
  [ChainId.BSC_MAINNET]: 102,
  [ChainId.BSC_TESTNET]: 10102,
  [ChainId.ETHEREUM]: 101,
  [ChainId.SEPOLIA]: 10161,
  [ChainId.OPBNB_MAINNET]: 202,
  [ChainId.OPBNB_TESTNET]: 10202,
  [ChainId.ARBITRUM_SEPOLIA]: 10231,
  [ChainId.ARBITRUM_ONE]: 110,
};

export const CHAIN_IDS_ON_LAYER_ZERO = Object.entries(LAYER_ZERO_CHAIN_IDS).reduce<
  Record<number, ChainId>
>(
  (acc, [chainId, layerZeroChainId]) => ({
    ...acc,
    [layerZeroChainId]: Number(chainId) as ChainId,
  }),
  {},
);

export const DEFAULT_ADAPTER_PARAMS =
  '0x000100000000000000000000000000000000000000000000000000000000000493E0';
