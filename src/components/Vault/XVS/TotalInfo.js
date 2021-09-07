import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compose } from 'recompose';
import { connectAccount } from 'core';
import commaNumber from 'comma-number';
import { Card } from 'components/Basic/Card';
import BigNumber from 'bignumber.js';

const TotalInfoWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 25px;
  background-color: var(--color-bg-primary);
  display: flex;
  justify-content: space-between;
  padding: 20px;
  flex-wrap: wrap;

  @media (max-width: 992px) {
    flex-direction: column;
  }

  .total-item {
    margin: 10px;
    @media (max-width: 992px) {
      margin: 10px;
    }

    .prop {
      font-weight: 600;
      font-size: 18px;
      color: var(--color-text-secondary);
    }

    .value {
      font-weight: 600;
      font-size: 20px;
      color: var(--color-white);
      margin-top: 10px;
    }
  }
`;

const format = commaNumber.bindWith(',', '.');

function TotalInfo({ settings, emission, pendingRewards }) {
  return (
    <Card>
      <TotalInfoWrapper>
        <div className="total-item">
          <div className="prop">XVS emission per day</div>
          <div className="value">{format(emission)} XVS</div>
        </div>
        <div className="total-item">
          <div className="prop">Total XVS Staked</div>
          <div className="value">{settings.vaultVaiStaked ? format(new BigNumber(settings.vaultVaiStaked).dp(4, 1).toString(10)) : 0} XVS</div>
        </div>
        <div className="total-item">
          <div className="prop">XVS Staking APY</div>
          <div className="value">{settings.vaiAPY}%</div>
        </div>
        <div className="total-item">
          <div className="prop">XVS Vault Reward Pool</div>
          <div className="value">{format(pendingRewards)} XVS</div>
        </div>
      </TotalInfoWrapper>
    </Card>
  );
}

TotalInfo.propTypes = {
  settings: PropTypes.object,
  emission: PropTypes.string.isRequired,
  pendingRewards: PropTypes.string.isRequired
};

TotalInfo.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

export default compose(connectAccount(mapStateToProps, undefined))(TotalInfo);
