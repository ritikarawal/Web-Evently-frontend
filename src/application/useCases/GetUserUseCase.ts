import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class GetUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(id: string): Promise<User> {
        return this.userRepository.getUserById(id);
    }
}