import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { getProposal } from 'clients/api/queries/getProposal';
import type { GetProposalInput, GetProposalOutput } from 'clients/api/queries/getProposal/types';
import { CHAIN_METADATA } from 'constants/chainMetadata';
import { DEFAULT_REFETCH_INTERVAL_MS } from 'constants/defaultRefetchInterval';
import FunctionKey from 'constants/functionKey';
import { governanceChain } from 'libs/wallet';
import { useGetCachedProposal } from './useGetCachedProposal';

export type UseGetProposalQueryKey = [FunctionKey.GET_PROPOSAL, GetProposalInput];

type Options = QueryObserverOptions<
  GetProposalOutput,
  Error,
  GetProposalOutput,
  GetProposalOutput,
  UseGetProposalQueryKey
>;

export const useGetProposal = (params: GetProposalInput, options?: Partial<Options>) => {
  const { blockTimeMs } = CHAIN_METADATA[governanceChain.id];

  // Initialize proposal using cache if available
  const cachedProposal = useGetCachedProposal({ proposalId: +params.proposalId });

  return useQuery({
    queryKey: [FunctionKey.GET_PROPOSAL, params],
    queryFn: () => getProposal(params),
    refetchInterval: blockTimeMs || DEFAULT_REFETCH_INTERVAL_MS,
    initialData: cachedProposal,
    refetchOnMount: false,
    ...options,
  });
};
