import BigNumber from 'bignumber.js';
import type { BscProposalFragment } from 'clients/subgraph/gql/generated/governanceBsc';
import type { NonBscProposalFragment } from 'clients/subgraph/gql/generated/governanceNonBsc';
import {
  type AbstainVoter,
  type AgainstVoter,
  type ForVoter,
  type Proposal,
  type RemoteProposal,
  VoteSupport,
} from 'types';
import {
  areAddressesEqual,
  compareBigNumbers,
  convertToDate,
  formatToProposalDescription,
  getProposalState,
  getProposalType,
  getUserVoteSupport,
} from 'utilities';
import { formatToProposalActions } from './formatToProposalActions';
import { formatToRemoteProposal } from './formatToRemoteProposal';

export const formatToProposal = ({
  gqlProposal,
  gqlRemoteProposalsMapping,
  currentBlockNumber,
  proposalMinQuorumVotesMantissa,
  accountAddress,
  blockTimeMs,
}: {
  gqlProposal: BscProposalFragment;
  gqlRemoteProposalsMapping: {
    [proposalId: number]: NonBscProposalFragment;
  };
  currentBlockNumber: number;
  proposalMinQuorumVotesMantissa: BigNumber;
  blockTimeMs: number;
  accountAddress?: string;
}) => {
  const executionEtaDate = convertToDate({ timestampSeconds: Number(gqlProposal.executionEta) });

  const nowMs = new Date().getTime();
  const startDate = new Date(
    nowMs + (Number(gqlProposal.startBlock) - currentBlockNumber) * blockTimeMs,
  );
  const endDate = new Date(
    nowMs + (Number(gqlProposal.endBlock) - currentBlockNumber) * blockTimeMs,
  );

  // Extract BSC proposal actions
  const proposalActions = formatToProposalActions({
    callDatas: gqlProposal.calldatas || [],
    signatures: gqlProposal.signatures || [],
    targets: gqlProposal.targets || [],
    values: gqlProposal.values || [],
  });

  const remoteProposals = gqlProposal.remoteProposals.reduce<RemoteProposal[]>(
    (
      acc,
      { proposalId, trustedRemote, stateTransactions, calldatas, signatures, targets, values },
    ) => {
      const gqlRemoteProposal = gqlRemoteProposalsMapping[proposalId];

      if (!gqlRemoteProposal) {
        return acc;
      }

      const remoteProposal = formatToRemoteProposal({
        proposalId: Number(gqlProposal.proposalId),
        layerZeroChainId: trustedRemote.layerZeroChainId,
        gqlRemoteProposal,
        bridgedTimestampSeconds: stateTransactions?.stored?.timestamp
          ? Number(stateTransactions.stored.timestamp)
          : undefined,
        withdrawnTimestampSeconds: stateTransactions?.withdrawn?.timestamp
          ? Number(stateTransactions.withdrawn.timestamp)
          : undefined,
        callDatas: calldatas ?? [],
        signatures: signatures ?? [],
        targets: targets ?? [],
        values: values ?? [],
      });

      return [...acc, remoteProposal];
    },
    [],
  );

  // Extract votes
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    totalVotesMantissa,
    abstainedVotesMantissa,
    againstVotesMantissa,
    forVotesMantissa,
    userVoteSupport,
  } = [...gqlProposal.votes]
    .sort((a, b) => compareBigNumbers(new BigNumber(a.votes), new BigNumber(b.votes), 'desc'))
    .reduce<{
      forVotes: ForVoter[];
      againstVotes: AgainstVoter[];
      abstainVotes: AbstainVoter[];
      totalVotesMantissa: BigNumber;
      abstainedVotesMantissa: BigNumber;
      againstVotesMantissa: BigNumber;
      forVotesMantissa: BigNumber;
      userVoteSupport?: VoteSupport;
    }>(
      (acc, gqlVote) => {
        const accCopy = { ...acc };

        const vote = {
          proposalId: gqlProposal.proposalId,
          address: gqlVote.voter.id,
          reason: gqlVote.reason ?? undefined,
          support: getUserVoteSupport({ voteSupport: gqlVote.support }),
          votesMantissa: new BigNumber(gqlVote.votes),
        };

        accCopy.totalVotesMantissa = accCopy.totalVotesMantissa.plus(vote.votesMantissa);

        if (vote.support === VoteSupport.For) {
          accCopy.forVotes.push(vote as ForVoter);
          accCopy.forVotesMantissa = accCopy.forVotesMantissa.plus(vote.votesMantissa);
        } else if (vote.support === VoteSupport.Against) {
          accCopy.againstVotes.push(vote as AgainstVoter);
          accCopy.againstVotesMantissa = accCopy.againstVotesMantissa.plus(vote.votesMantissa);
        } else {
          accCopy.abstainVotes.push(vote as AbstainVoter);
          accCopy.abstainedVotesMantissa = accCopy.abstainedVotesMantissa.plus(vote.votesMantissa);
        }

        if (!!accountAddress && areAddressesEqual(accountAddress, vote.address)) {
          accCopy.userVoteSupport = vote.support;
        }

        return accCopy;
      },
      {
        forVotes: [],
        againstVotes: [],
        abstainVotes: [],
        totalVotesMantissa: new BigNumber(0),
        abstainedVotesMantissa: new BigNumber(0),
        againstVotesMantissa: new BigNumber(0),
        forVotesMantissa: new BigNumber(0),
        userVoteSupport: undefined,
      },
    );

  const result: Proposal = {
    proposalId: Number(gqlProposal.proposalId),
    proposalType: getProposalType({ type: gqlProposal.type }),
    proposerAddress: gqlProposal.proposer.id,
    state: getProposalState({
      startBlockNumber: Number(gqlProposal.startBlock),
      endBlockNumber: Number(gqlProposal.endBlock),
      currentBlockNumber,
      proposalMinQuorumVotesMantissa,
      forVotesMantissa,
      passing: gqlProposal.passing,
      queued: !!gqlProposal.queued?.timestamp,
      executed: !!gqlProposal.executed?.timestamp,
      canceled: !!gqlProposal.canceled?.timestamp,
      executionEtaTimestampMs: Number(gqlProposal.executionEta * 1000),
    }),
    description: formatToProposalDescription({ description: gqlProposal.description }),
    endBlock: +gqlProposal.endBlock,
    createdDate: gqlProposal.created?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlProposal.created.timestamp) })
      : undefined,
    cancelDate: gqlProposal.canceled?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlProposal.canceled.timestamp) })
      : undefined,
    queuedDate: gqlProposal.queued?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlProposal.queued.timestamp) })
      : undefined,
    executedDate: gqlProposal.executed?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlProposal.executed.timestamp) })
      : undefined,
    proposalActions,
    forVotes,
    againstVotes,
    abstainVotes,
    abstainedVotesMantissa,
    againstVotesMantissa,
    forVotesMantissa,
    totalVotesMantissa,
    userVoteSupport,
    createdTxHash: gqlProposal.created?.txHash,
    cancelTxHash: gqlProposal.canceled?.txHash,
    executedTxHash: gqlProposal.executed?.txHash,
    queuedTxHash: gqlProposal.queued?.txHash,
    startDate,
    endDate,
    executionEtaDate,
    remoteProposals,
  };

  return result;
};
