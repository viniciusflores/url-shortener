export interface ClickEvent {
  id: string;
  shortener_url_id: string;
  ip: string | null;
  userAgent: string | null;
}

export interface IClickEventRepository {
  create(
    shortenerUrlId: string,
    ip: string,
    userAgent: string,
  ): Promise<ClickEvent>;
  getDataByHash(hash: string): Promise<ClickEvent[] | null>;
}
