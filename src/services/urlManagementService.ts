import { BadRequestError, NotFoundError } from '../lib/errors';
import type { IUrlRepository } from '../repositories/interfaces/urlRepository';
import type { IUserRepository } from '../repositories/interfaces/userRepository';

export class UrlManagementService {
  constructor(
    private urlRepository: IUrlRepository,
    private userRepository: IUserRepository,
  ) {}

  async showMyUrls(userId: string): Promise<any> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError('Invalid user ID');
    }

    const existUser = await this.userRepository.getById(userId);
    if (!existUser) {
      throw new NotFoundError('User not found');
    }

    return await this.urlRepository.findByUserId(userId);
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

    return existRecord;
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
    if (!newAlias || typeof newAlias !== 'string' || newAlias.trim() === '') {
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
  }
}
