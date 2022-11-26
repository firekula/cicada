import styled, { css } from 'styled-components';
import mm from '@/global_states/mini_mode';
import { CONTROLLER_HEIGHT, QueueMusic, ZIndex } from '../constants';
import Cover from './cover';
import Operation from './operation';
import Info from './info';
import Progress from './progress';
import Time from './time';

const Style = styled.div`
  z-index: ${ZIndex.CONTROLLER};

  height: ${CONTROLLER_HEIGHT}px;

  display: flex;
  flex-direction: column;

  background-color: rgb(255 255 255 / 0.75);

  > .content {
    flex: 1;
    min-height: 0;

    display: flex;
    align-items: center;
  }

  ${({ theme: { miniMode } }) => css`
    > .content {
      gap: ${miniMode ? 10 : 20}px;
    }
  `}
`;

function Controller({
  queueMusic,
  paused,
  loading,
  duration,
}: {
  queueMusic: QueueMusic;
  paused: boolean;
  loading: boolean;
  duration: number;
}) {
  const miniMode = mm.useState();
  return (
    <Style>
      <Progress duration={duration} />
      <div className="content">
        <Info queueMusic={queueMusic} />
        {miniMode ? null : <Time duration={duration} />}
        <Operation paused={paused} loading={loading} />
        <Cover cover={queueMusic.cover} />
      </div>
    </Style>
  );
}

export default Controller;
