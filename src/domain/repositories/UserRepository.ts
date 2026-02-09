import { User } from '../entities/User';

export interface UserRepository {
    getUserById(id: string): Promise<User>;
    createUser(user: User): Promise<User>;
}