import { useQueryClient } from '@tanstack/react-query';
import type { Proposal } from 'types';
import type { GetProposalsOutput } from '../../getProposals';
import FunctionKey from 'constants/functionKey';

export const useGetCachedProposal = ({ proposalId }: { proposalId: number }) => {
  const queryClient = useQueryClient();
  const cachedProposals = queryClient.getQueriesData<GetProposalsOutput>({
    queryKey: [FunctionKey.GET_PROPOSALS],
  });

  let cachedProposal: Proposal | undefined;

  cachedProposals.forEach(([_queryKey, data]) =>
    (data?.proposals || []).forEach(proposal => {
      if (+proposal.proposalId === proposalId) {
        cachedProposal = proposal;
      }
    }),
  );

  return cachedProposal;
};
