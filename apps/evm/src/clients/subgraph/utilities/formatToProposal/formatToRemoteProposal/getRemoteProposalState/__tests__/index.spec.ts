import { PROPOSAL_EXECUTION_GRACE_PERIOD_MS } from 'constants/chainMetadata';
import { RemoteProposalState } from 'types';
import { getRemoteProposalState } from '..';

describe('getRemoteProposalState', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2024-03-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Canceled when canceled is true', () => {
    const result = getRemoteProposalState({
      bridged: true,
      queued: true,
      executed: false,
      canceled: true,
    });
    expect(result).toBe(RemoteProposalState.Canceled);
  });

  it('returns Executed when executed is true', () => {
    const result = getRemoteProposalState({
      bridged: true,
      queued: true,
      executed: true,
      canceled: false,
    });
    expect(result).toBe(RemoteProposalState.Executed);
  });

  it('returns Pending when not bridged and not queued', () => {
    const result = getRemoteProposalState({
      bridged: false,
      queued: false,
      executed: false,
      canceled: false,
    });
    expect(result).toBe(RemoteProposalState.Pending);
  });

  it('returns Bridged when bridged and not queued', () => {
    const result = getRemoteProposalState({
      bridged: true,
      queued: false,
      executed: false,
      canceled: false,
    });
    expect(result).toBe(RemoteProposalState.Bridged);
  });

  it('returns Queued when queued and not expired', () => {
    const result = getRemoteProposalState({
      bridged: true,
      queued: true,
      executed: false,
      canceled: false,
      executionEtaDate: new Date('2024-03-14T13:00:00Z'),
    });
    expect(result).toBe(RemoteProposalState.Queued);
  });

  it('returns Queued when queued and executionEtaDate is undefined', () => {
    const result = getRemoteProposalState({
      bridged: true,
      queued: true,
      executed: false,
      canceled: false,
    });
    expect(result).toBe(RemoteProposalState.Queued);
  });

  it('returns Expired when queued and expired', () => {
    const executionEtaDate = new Date('2024-03-14T11:59:59Z');
    executionEtaDate.setMilliseconds(
      executionEtaDate.getMilliseconds() - PROPOSAL_EXECUTION_GRACE_PERIOD_MS - 1,
    );

    const result = getRemoteProposalState({
      bridged: true,
      queued: true,
      executed: false,
      canceled: false,
      executionEtaDate,
    });
    expect(result).toBe(RemoteProposalState.Expired);
  });
});
