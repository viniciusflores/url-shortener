export interface UserRecord {
  id: string;
  email: string;
  password_hashed: string;
}

export interface IUserRepository {
  create(email: string, password_hashed: string): Promise<UserRecord>;
  getByEmail(email: string): Promise<UserRecord | null>;
  getById(id: string): Promise<UserRecord | null>;
}
