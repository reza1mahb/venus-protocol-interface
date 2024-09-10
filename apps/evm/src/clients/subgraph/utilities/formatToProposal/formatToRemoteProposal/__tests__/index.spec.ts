import nonBscProposalsResponse from '__mocks__/subgraph/nonBscProposals.json';
import { RemoteProposalState } from 'types';
import type Vi from 'vitest';
import { formatToProposalActions } from '../../formatToProposalActions';
import { getRemoteProposalState } from '../getRemoteProposalState';

import { formatToRemoteProposal } from '..';

vi.mock('../getRemoteProposalState');
vi.mock('../../formatToProposalActions');

const params = {
  layerZeroChainId: 10161,
  proposalId: 1,
  gqlRemoteProposal: nonBscProposalsResponse.proposals[0],
};

describe('formatToRemoteProposal', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2024-03-14T12:00:00Z'));

    (getRemoteProposalState as Vi.Mock).mockImplementation(() => RemoteProposalState.Pending);
    (formatToProposalActions as Vi.Mock).mockImplementation(() => []);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns pending remote proposal in the correct format', () => {
    const result = formatToRemoteProposal(params);

    expect(result).toMatchSnapshot();
  });

  it('returns withdrawn remote proposal in the correct format', () => {
    const result = formatToRemoteProposal({
      ...params,
      withdrawnTimestampSeconds: 1656499403,
    });

    expect(result).toMatchSnapshot();
  });

  it('returns canceled remote proposal in the correct format', () => {
    const result = formatToRemoteProposal({
      ...params,
      gqlRemoteProposal: {
        ...nonBscProposalsResponse.proposals[0],
        canceled: {
          id: '0x544c7a7eaa39193348b5907232f9cee66c8aa6f609200d03792289b40487d164',
          timestamp: '1720520363',
        },
        executed: null,
      },
      bridgedTimestampSeconds: 1656499403,
    });

    expect(result).toMatchSnapshot();
  });

  it('returns bridged remote proposal in the correct format', () => {
    const result = formatToRemoteProposal({
      ...params,
      bridgedTimestampSeconds: 1656499403,
    });

    expect(result).toMatchSnapshot();
  });

  it('returns expired remote proposal in the correct format', () => {
    (getRemoteProposalState as Vi.Mock).mockImplementation(() => RemoteProposalState.Expired);

    const result = formatToRemoteProposal({
      ...params,
      gqlRemoteProposal: {
        ...nonBscProposalsResponse.proposals[0],
        executed: null,
      },
    });

    expect(result).toMatchSnapshot();
  });
});
