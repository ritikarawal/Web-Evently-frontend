import { useEffect, useState } from 'react';
import { GetUserUseCase } from '../../../application/useCases/GetUserUseCase';
import { ApiUserRepository } from '../../../infrastructure/repositories/ApiUserRepository';
import { User } from '../../../domain/entities/User';

const userRepository = new ApiUserRepository();
const getUserUseCase = new GetUserUseCase(userRepository);

export default function UserPage({ id }: { id: string }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUserUseCase.execute(id).then(setUser);
    }, [id]);

    return <div>{user ? <p>{user.name}</p> : <p>Loading...</p>}</div>;
}

export async function getServerSideProps({ params }: any) {
    return { props: { id: params.id } };
}