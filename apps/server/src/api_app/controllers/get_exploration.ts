import { ALIAS_DIVIDER, AssetType } from '#/constants';
import { getDB } from '@/db';
import { Music, Property as MusicProperty } from '@/db/music';
import { User, Property as UserProperty } from '@/db/user';
import { Musicbill, Property as MusicbillProperty } from '@/db/musicbill';
import {
  Singer,
  Property as SingerProperty,
  getSingerListInMusicIds,
} from '@/db/singer';
import { getAssetPublicPath } from '@/platform/asset';
import excludeProperty from '#/utils/exclude_property';
import { Context } from '../constants';

const QUALITY = 20;

type MusicbillCreateUser = Pick<User, UserProperty.ID | UserProperty.NICKNAME>;
type MusicSinger = Pick<
  Singer,
  SingerProperty.ID | SingerProperty.NAME | SingerProperty.ALIASES
> & {
  musicId: string;
};

export default async (ctx: Context) => {
  const [musicList, singerList, musicbillList] = await Promise.all([
    getDB().all<
      Pick<Music, MusicProperty.ID | MusicProperty.NAME | MusicProperty.COVER>
    >(
      `
        SELECT
          id,
          name,
          cover
        FROM music
        ORDER BY random()
        LIMIT ?
      `,
      [QUALITY],
    ),
    getDB().all<
      Pick<
        Singer,
        | SingerProperty.ID
        | SingerProperty.NAME
        | SingerProperty.ALIASES
        | SingerProperty.AVATAR
      >
    >(
      `
        SELECT
          id,
          name,
          aliases,
          avatar
        FROM singer
        ORDER BY random()
        LIMIT ?
      `,
      [QUALITY],
    ),
    getDB().all<
      Pick<
        Musicbill,
        | MusicbillProperty.ID
        | MusicbillProperty.COVER
        | MusicbillProperty.NAME
        | MusicbillProperty.USER_ID
      >
    >(
      `
        SELECT
          id,
          cover,
          name,
          userId
        FROM musicbill
        WHERE public = 1
        ORDER BY random()
        LIMIT ? 
      `,
      [QUALITY],
    ),
  ]);

  const [musicSingerList, musicbillCreateUserList]: [
    MusicSinger[],
    MusicbillCreateUser[],
  ] = await Promise.all([
    musicList.length
      ? getSingerListInMusicIds(
          musicList.map((m) => m.id),
          [SingerProperty.ID, SingerProperty.NAME, SingerProperty.ALIASES],
        )
      : [],
    musicbillList.length
      ? getDB().all<MusicbillCreateUser>(
          `
            SELECT
              id,
              nickname
            FROM user
            WHERE id IN ( ${musicbillList.map(() => '?').join(', ')} )
          `,
          musicbillList.map((mb) => mb.userId),
        )
      : [],
  ]);

  return ctx.success({
    musicList: musicList.map((m) => ({
      ...m,
      cover: getAssetPublicPath(m.cover, AssetType.MUSIC_COVER),
      singers: musicSingerList
        .filter((s) => s.musicId === m.id)
        .map((s) => excludeProperty(s, ['musicId'])),
    })),
    singerList: singerList.map((s) => ({
      ...s,
      avatar: getAssetPublicPath(s.avatar, AssetType.SINGER_AVATAR),
      aliases: s.aliases ? s.aliases.split(ALIAS_DIVIDER) : [],
    })),
    musicbillList: musicbillList.map((mb) => ({
      ...excludeProperty(mb, [MusicbillProperty.USER_ID]),
      cover: getAssetPublicPath(mb.cover, AssetType.MUSICBILL_COVER),
      user: musicbillCreateUserList.find((u) => mb.userId === u.id)!,
    })),
  });
};
