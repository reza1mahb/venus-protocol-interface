import { PROPOSAL_EXECUTION_GRACE_PERIOD_MS } from 'constants/chainMetadata';
import { RemoteProposalState } from 'types';

export const getRemoteProposalState = ({
  bridged,
  queued,
  canceled,
  executed,
  executionEtaDate,
}: {
  bridged: boolean;
  queued: boolean;
  executed: boolean;
  canceled: boolean;
  executionEtaDate?: Date;
}) => {
  if (canceled) {
    return RemoteProposalState.Canceled;
  }

  if (executed) {
    return RemoteProposalState.Executed;
  }

  if (!bridged && !queued) {
    return RemoteProposalState.Pending;
  }

  if (bridged && !queued) {
    return RemoteProposalState.Bridged;
  }

  if (!executionEtaDate) {
    return RemoteProposalState.Queued;
  }

  const nowMs = new Date().getTime();
  const expiredEtaTimestampMs = executionEtaDate.getTime() + PROPOSAL_EXECUTION_GRACE_PERIOD_MS;

  const expired = expiredEtaTimestampMs < nowMs;

  if (queued && !expired) {
    return RemoteProposalState.Queued;
  }

  return RemoteProposalState.Expired;
};
