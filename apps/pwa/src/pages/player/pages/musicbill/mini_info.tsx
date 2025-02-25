import Cover from '@/components/cover';
import { CSSVariable } from '@/global_style';
import ellipsis from '@/style/ellipsis';
import styled from 'styled-components';
import { Musicbill } from '../../constants';
import { MINI_INFO_HEIGHT } from './constants';
import Operation from './operation';

const Style = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${MINI_INFO_HEIGHT}px;
  padding: 0 20px;

  backdrop-filter: blur(5px);

  display: flex;
  align-items: center;
  gap: 10px;

  > .name {
    flex: 1;
    min-width: 0;

    font-size: 14px;
    font-weight: bold;
    color: ${CSSVariable.TEXT_COLOR_PRIMARY};
    ${ellipsis}
  }
`;

function MiniInfo({ musicbill }: { musicbill: Musicbill }) {
  return (
    <Style>
      <Cover
        src={musicbill.cover}
        size={32}
        style={{
          outline: musicbill.public
            ? `2px solid ${CSSVariable.COLOR_PRIMARY}`
            : 'none',
        }}
      />
      <div className="name">{musicbill.name}</div>
      <Operation musicbill={musicbill} />
    </Style>
  );
}

export default MiniInfo;
