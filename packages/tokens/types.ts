import type { ChainId } from '@venusprotocol/chains';

export interface Token {
  symbol: string;
  decimals: number;
  asset: string;
  address: string;
  isNative?: boolean;
  tokenWrapped?: Token;
}

export type TokenAction = 'swapAndSupply' | 'supply' | 'withdraw' | 'borrow' | 'repay';

export type TokenMapping = {
  [chainId in ChainId]: Token[];
};

export type DisabledTokenActionMapping = {
  [chainId in ChainId]: DisabledTokenAction[];
};

export interface DisabledTokenAction {
  address: string;
  disabledActions: TokenAction[];
}
