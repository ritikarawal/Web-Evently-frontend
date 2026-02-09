import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class ApiUserRepository implements UserRepository {
    async getUserById(id: string): Promise<User> {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    }

    async createUser(user: User): Promise<User> {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        return response.json();
    }
}