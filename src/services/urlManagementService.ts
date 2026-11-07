import { BadRequestError, NotFoundError } from '../lib/errors';
import type { IUrlRepository } from '../repositories/interfaces/urlRepository';
import type { IUserRepository } from '../repositories/interfaces/userRepository';
import type { IClickEventRepository } from '../repositories/interfaces/clickEventRepository';
import { redisCacheUrlShortener } from '../lib/cache';
import { isValidCustomAlias } from '../lib/validators';

export class UrlManagementService {
  constructor(
    private urlRepository: IUrlRepository,
    private userRepository: IUserRepository,
    private clickEventRepository: IClickEventRepository,
  ) {}

  async showMyUrls(userId: string): Promise<any> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }

    const existUser = await this.userRepository.getById(userId);
    if (!existUser) {
      throw new NotFoundError('User not found');
    }

    const urls = await this.urlRepository.findByUserId(userId);
    const counts = await this.clickEventRepository.countByHashes(
      urls.map((url) => url.hashed_url),
    );

    return urls.map((url) => ({
      ...url,
      clicks: counts.get(url.hashed_url) ?? 0,
    }));
  }

  async showMyUrlByHash(userId: string, hash: string): Promise<any> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new BadRequestError('Invalid hash');
    }

    const existUser = await this.userRepository.getById(userId);
    if (!existUser) {
      throw new NotFoundError('User not found');
    }

    const existRecord = await this.urlRepository.findByUserIdAndHash(
      userId,
      hash,
    );
    if (!existRecord) {
      throw new NotFoundError('Url not found');
    }

    const counts = await this.clickEventRepository.countByHashes([hash]);

    return { ...existRecord, clicks: counts.get(hash) ?? 0 };
  }

  async updateAlias(
    userId: string,
    hash: string,
    newAlias: string,
  ): Promise<any> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new BadRequestError('Invalid hash');
    }
    if (
      !newAlias ||
      typeof newAlias !== 'string' ||
      !isValidCustomAlias(newAlias)
    ) {
      throw new BadRequestError('Invalid new alias');
    }
    const existUser = await this.userRepository.getById(userId);
    if (!existUser) {
      throw new NotFoundError('User not found');
    }
    const existRecord = await this.urlRepository.findByUserIdAndHash(
      userId,
      hash,
    );
    if (!existRecord) {
      throw new NotFoundError('Url not found');
    }
    const existNewAliasRecord = await this.urlRepository.findByHash(newAlias);
    if (existNewAliasRecord) {
      throw new BadRequestError('Custom alias already taken');
    }

    const updatedUrl = await this.urlRepository.updateAlias(
      userId,
      hash,
      newAlias,
    );
    await redisCacheUrlShortener.invalidate(hash);
    return updatedUrl;
  }

  async deleteUrl(userId: string, hash: string): Promise<void> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }
    if (!hash || typeof hash !== 'string' || hash.trim() === '') {
      throw new BadRequestError('Invalid hash');
    }
    const existUser = await this.userRepository.getById(userId);
    if (!existUser) {
      throw new NotFoundError('User not found');
    }
    const existRecord = await this.urlRepository.findByUserIdAndHash(
      userId,
      hash,
    );
    if (!existRecord) {
      throw new NotFoundError('URL not found for the user');
    }

    await this.urlRepository.deleteByUserIdAndHash(userId, hash);
    await redisCacheUrlShortener.invalidate(hash);
  }
}
