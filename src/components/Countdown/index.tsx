/** @jsxImportSource @emotion/react */
import React from 'react';
import ReactCountdown from 'react-countdown';
import { CountdownRenderProps } from 'react-countdown/dist/Countdown';
import { Typography } from '@mui/material';
import { useTranslation } from 'translation';

interface ICoundownProps {
  date: Date;
  className?: string;
}

export const Countdown: React.FC<ICoundownProps> = ({ date, className }) => {
  const { t } = useTranslation();
  const countdownRenderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: CountdownRenderProps) => {
    if (completed) {
      // Render a completed state
      return null;
    }
    // Render a countdown
    if (days) {
      return t('voteProposalUi.countdownFormat.daysIncluded', { days, hours, minutes, seconds });
    }
    if (hours) {
      return t('voteProposalUi.countdownFormat.hoursIncluded', { hours, minutes, seconds });
    }
    if (minutes) {
      return t('voteProposalUi.countdownFormat.minutesIncluded', { minutes, seconds });
    }
    return t('voteProposalUi.countdownFormat.secondsIncluded', { seconds });
  };

  return (
    <Typography color="textPrimary" variant="small2" className={className}>
      <ReactCountdown date={date} renderer={countdownRenderer} />
    </Typography>
  );
};
