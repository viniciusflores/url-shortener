import {
  ClickEvent,
  ClickEventRange,
  IClickEventRepository,
} from '../interfaces/clickEventRepository';
import { prisma } from './prismaClient';

export class PrismaClickEventRepository implements IClickEventRepository {
  async create(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent> {
    const data = await prisma.clickEvent.create({
      data: {
        shortener_url_id: shortenerUrlId,
        ip: ip,
        userAgent: userAgent,
      },
    });

    return data;
  }

  async countByHashes(hashes: string[]): Promise<Map<string, number>> {
    const groups = await prisma.clickEvent.groupBy({
      by: ['shortener_url_id'],
      where: { shortener_url_id: { in: hashes } },
      _count: { _all: true },
    });

    return new Map(
      groups.map((group) => [group.shortener_url_id, group._count._all]),
    );
  }

  async getDataByHash(
    hash: string,
    range: ClickEventRange = {},
  ): Promise<ClickEvent[] | null> {
    const data = await prisma.clickEvent.findMany({
      where: {
        shortener_url_id: hash,
        createdAt: { gte: range.from, lt: range.to },
      },
      orderBy: { createdAt: 'asc' },
    });

    return data;
  }
}
