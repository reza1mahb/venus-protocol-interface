import type { NonBscProposalFragment } from 'clients/subgraph/gql/generated/governanceNonBsc';
import { PROPOSAL_EXECUTION_GRACE_PERIOD_MS } from 'constants/chainMetadata';
import { CHAIN_IDS_ON_LAYER_ZERO } from 'constants/layerZero';
import { type RemoteProposal, RemoteProposalState } from 'types';
import { convertToDate } from 'utilities';
import { formatToProposalActions } from '../formatToProposalActions';
import { getRemoteProposalState } from './getRemoteProposalState';

export const formatToRemoteProposal = ({
  proposalId,
  layerZeroChainId,
  gqlRemoteProposal,
  bridgedTimestampSeconds,
  withdrawnTimestampSeconds,
  callDatas,
  signatures,
  targets,
  values,
}: {
  layerZeroChainId: number;
  proposalId: number;
  callDatas: string[];
  signatures: string[];
  targets: string[];
  values: string[];
  gqlRemoteProposal: NonBscProposalFragment;
  bridgedTimestampSeconds?: number;
  withdrawnTimestampSeconds?: number;
}) => {
  const chainId = CHAIN_IDS_ON_LAYER_ZERO[layerZeroChainId];
  const canceledTimestampSeconds =
    withdrawnTimestampSeconds || gqlRemoteProposal.canceled?.timestamp;

  const executionEtaDate = gqlRemoteProposal.executionEta
    ? convertToDate({ timestampSeconds: Number(gqlRemoteProposal.executionEta) })
    : undefined;

  const state = getRemoteProposalState({
    bridged: !!bridgedTimestampSeconds,
    queued: !!gqlRemoteProposal.queued?.timestamp,
    executed: !!gqlRemoteProposal.executed?.timestamp,
    canceled: !!canceledTimestampSeconds,
    executionEtaDate,
  });

  const expiredDate =
    state === RemoteProposalState.Expired && executionEtaDate
      ? new Date(executionEtaDate.getTime() + PROPOSAL_EXECUTION_GRACE_PERIOD_MS)
      : undefined;

  const remoteProposal: RemoteProposal = {
    proposalId,
    remoteProposalId: Number(gqlRemoteProposal.proposalId),
    chainId,
    proposalActions: formatToProposalActions({
      callDatas,
      signatures,
      targets,
      values,
    }),
    canceledDate: canceledTimestampSeconds
      ? convertToDate({ timestampSeconds: canceledTimestampSeconds })
      : undefined,
    bridgedDate: bridgedTimestampSeconds
      ? convertToDate({ timestampSeconds: bridgedTimestampSeconds })
      : undefined,
    queuedDate: gqlRemoteProposal.queued?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlRemoteProposal.queued.timestamp) })
      : undefined,
    executionEtaDate,
    executedDate: gqlRemoteProposal.executed?.timestamp
      ? convertToDate({ timestampSeconds: Number(gqlRemoteProposal.executed.timestamp) })
      : undefined,
    expiredDate,
    state,
  };

  return remoteProposal;
};
