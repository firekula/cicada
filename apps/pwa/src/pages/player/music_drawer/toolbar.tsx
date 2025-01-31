import styled from 'styled-components';
import IconButton from '@/components/icon_button';
import {
  MdPlayArrow,
  MdReadMore,
  MdOutlinePostAdd,
  MdPlaylistAdd,
  MdEdit,
  MdDownload,
} from 'react-icons/md';
import p from '@/global_states/profile';
import { IS_IPAD, IS_IPHONE } from '@/constants/browser';
import playerEventemitter, {
  EventType as PlayerEventType,
} from '../eventemitter';
import { MINI_INFO_HEIGHT, MusicDetail } from './constants';
import e, { EventType } from './eventemitter';

const Style = styled.div`
  z-index: 1;

  position: sticky;
  top: ${MINI_INFO_HEIGHT}px;
  padding: 5px 20px;

  display: flex;
  align-items: center;
  gap: 5px;

  backdrop-filter: blur(5px);

  > .left {
    flex: 1;
    min-width: 0;

    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

function Toolbar({ music }: { music: MusicDetail }) {
  const profile = p.useState()!;
  return (
    <Style>
      <div className="left">
        <IconButton
          onClick={() =>
            playerEventemitter.emit(PlayerEventType.ACTION_PLAY_MUSIC, {
              music,
            })
          }
        >
          <MdPlayArrow />
        </IconButton>
        <IconButton
          onClick={() =>
            playerEventemitter.emit(
              PlayerEventType.ACTION_INSERT_MUSIC_TO_PLAYQUEUE,
              {
                music,
              },
            )
          }
        >
          <MdReadMore />
        </IconButton>
        <IconButton
          onClick={() =>
            playerEventemitter.emit(
              PlayerEventType.OPEN_ADD_MUSIC_TO_MUSICBILL_DRAWER,
              {
                music,
              },
            )
          }
        >
          <MdOutlinePostAdd />
        </IconButton>
        <IconButton
          onClick={() =>
            playerEventemitter.emit(
              PlayerEventType.ACTION_ADD_MUSIC_LIST_TO_PLAYLIST,
              {
                musicList: [music],
              },
            )
          }
        >
          <MdPlaylistAdd />
        </IconButton>
        {IS_IPAD || IS_IPHONE ? null : (
          <IconButton
            onClick={() =>
              playerEventemitter.emit(
                PlayerEventType.OPEN_MUSIC_DOWNLOAD_DIALOG,
                {
                  music,
                },
              )
            }
          >
            <MdDownload />
          </IconButton>
        )}
      </div>
      {profile.admin || profile.id === music.createUser.id ? (
        <IconButton onClick={() => e.emit(EventType.OPEN_EDIT_MENU, null)}>
          <MdEdit />
        </IconButton>
      ) : null}
    </Style>
  );
}

export default Toolbar;
