import type { ChainId } from '@venusprotocol/chains';
import { areAddressesEqual } from '@venusprotocol/utilities';

import disabledTokenActions from 'infos/disabledTokenActions';
import type { TokenAction } from 'types';

export interface IsTokenActionEnabledInput {
  tokenAddress: string;
  chainId: ChainId;
  action: TokenAction;
}

// TODO: add tests

export const isTokenActionEnabled = ({
  tokenAddress,
  chainId,
  action,
}: IsTokenActionEnabledInput) => {
  const disabledToken = disabledTokenActions[chainId].find(item =>
    areAddressesEqual(item.address, tokenAddress),
  );

  return !disabledToken || !disabledToken.disabledActions.includes(action);
};
