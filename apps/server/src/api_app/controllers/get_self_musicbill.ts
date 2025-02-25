import { ALIAS_DIVIDER, AssetType } from '#/constants';
import { ExceptionCode } from '#/constants/exception';
import {
  getMusicbillById,
  Property as MusicbillProperty,
} from '@/db/musicbill';
import { Music, Property as MusicProperty } from '@/db/music';
import {
  getSingerListInMusicIds,
  Property as SingerProperty,
} from '@/db/singer';
import excludeProperty from '#/utils/exclude_property';
import { getAssetPublicPath } from '@/platform/asset';
import { getDB } from '@/db';
import { Context } from '../constants';

export default async (ctx: Context) => {
  const { id } = ctx.query as { id?: string };

  if (typeof id !== 'string' || !id.length) {
    return ctx.except(ExceptionCode.PARAMETER_ERROR);
  }

  const musicbill = await getMusicbillById(id, [
    MusicbillProperty.ID,
    MusicbillProperty.USER_ID,
    MusicbillProperty.COVER,
    MusicbillProperty.NAME,
    MusicbillProperty.PUBLIC,
    MusicbillProperty.CREATE_TIMESTAMP,
  ]);

  if (!musicbill || musicbill.userId !== ctx.user.id) {
    return ctx.except(ExceptionCode.MUSICBILL_NOT_EXIST);
  }

  const musicList = await getDB().all<
    Pick<
      Music,
      | MusicProperty.ID
      | MusicProperty.TYPE
      | MusicProperty.NAME
      | MusicProperty.ALIASES
      | MusicProperty.COVER
      | MusicProperty.SQ
      | MusicProperty.HQ
      | MusicProperty.AC
    >
  >(
    `
      SELECT
        m.id,
        m.type,
        m.name,
        m.aliases,
        m.cover,
        m.sq,
        m.hq,
        m.ac
      FROM
        musicbill_music AS mm
        LEFT JOIN music AS m ON mm.musicId = m.id 
      WHERE
        mm.musicbillId = ? 
      ORDER BY
        mm.addTimestamp DESC;
    `,
    [id],
  );

  const musicIdMapSingers: {
    [key: string]: {
      id: string;
      name: string;
      aliases: string[];
    }[];
  } = {};
  if (musicList.length) {
    const allSingerList = await getSingerListInMusicIds(
      Array.from(new Set(musicList.map((m) => m.id))),
      [SingerProperty.ID, SingerProperty.NAME, SingerProperty.ALIASES],
    );
    for (const singer of allSingerList) {
      if (!musicIdMapSingers[singer.musicId]) {
        musicIdMapSingers[singer.musicId] = [];
      }
      musicIdMapSingers[singer.musicId].push({
        ...excludeProperty(singer, ['musicId']),
        aliases: singer.aliases ? singer.aliases.split(ALIAS_DIVIDER) : [],
      });
    }
  }

  return ctx.success({
    ...excludeProperty(musicbill, [MusicbillProperty.USER_ID]),
    cover: getAssetPublicPath(musicbill.cover, AssetType.MUSICBILL_COVER),
    musicList: musicList.map((m) => ({
      ...m,
      aliases: m.aliases ? m.aliases.split(ALIAS_DIVIDER) : [],
      cover: getAssetPublicPath(m.cover, AssetType.MUSIC_COVER),
      sq: getAssetPublicPath(m.sq, AssetType.MUSIC_SQ),
      hq: getAssetPublicPath(m.hq, AssetType.MUSIC_HQ),
      ac: getAssetPublicPath(m.ac, AssetType.MUSIC_AC),
      singers: musicIdMapSingers[m.id] || [],
    })),
  });
};
