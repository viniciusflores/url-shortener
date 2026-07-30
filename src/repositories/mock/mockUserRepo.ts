import { randomUUID } from 'node:crypto';
import type { IUserRepository, UserRecord } from '../interfaces/userRepository';

export class MockUserRepository implements IUserRepository {
  private databaseInMemory: UserRecord[] = [];

  async create(email: string, password_hashed: string): Promise<UserRecord> {
    const record: UserRecord = {
      id: randomUUID(),
      email: email,
      password_hashed: password_hashed,
    };
    this.databaseInMemory.push(record);
    return record;
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    return this.databaseInMemory.find((usr) => usr.email === email) ?? null;
  }

  async getById(id: string): Promise<UserRecord | null> {
    return this.databaseInMemory.find((usr) => usr.id === id) ?? null;
  }

  // Helper for tests: reset state of the in-memory database
  reset(): void {
    this.databaseInMemory = [];
  }
}
