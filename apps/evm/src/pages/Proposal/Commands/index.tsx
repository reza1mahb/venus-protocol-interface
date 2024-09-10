import { Card, type CardProps } from 'components';
import { useTranslation } from 'libs/translations';
import { type Proposal, RemoteProposalState } from 'types';
import { Command } from './Command';
import { Progress } from './Progress';

export interface CommandsProps extends CardProps {
  proposal: Proposal;
}

export const Commands: React.FC<CommandsProps> = ({ proposal, ...otherProps }) => {
  const { t } = useTranslation();

  const totalPayloadsCount = proposal.remoteProposals.length + 1; // Remote proposals + BSc proposal

  // TODO: include BSC proposal (see VEN-2701)
  const successfulPayloadsCount = proposal.remoteProposals.reduce(
    (acc, command) => (command.state === RemoteProposalState.Executed ? acc + 1 : acc),
    0,
  );

  return (
    <Card {...otherProps}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">{t('voteProposalUi.commands.title')}</h3>

        <Progress
          successfulPayloadsCount={successfulPayloadsCount}
          totalPayloadsCount={totalPayloadsCount}
        />
      </div>

      <div className="space-y-4">
        {proposal.remoteProposals.map(command => (
          <Command
            {...command}
            className="border-b border-b-lightGrey pb-4 last:pb-0 last:border-b-0"
          />
        ))}
      </div>
    </Card>
  );
};
