export interface ClickEvent {
  id: string;
  shortener_url_id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ClickEventRange {
  from?: Date;
  to?: Date;
}

export interface IClickEventRepository {
  create(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent>;
  getDataByHash(
    hash: string,
    range?: ClickEventRange,
  ): Promise<ClickEvent[] | null>;
}
