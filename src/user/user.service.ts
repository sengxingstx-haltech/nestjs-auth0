import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'emily',
      password: 'ewrtyuii',
      provider: 'local',
    },
    {
      userId: 2,
      username: 'joseph',
      password: 'lkgrtyuiohg',
      provider: 'local',
    },
  ]

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async add(user: Omit<User, 'userId'>) {
    const lastId = this.users.sort((a, b) => a.userId - b.userId)[0].userId;
    const userData = { ...user, userId: lastId + 1 };
    this.users.push(userData);
    return userData;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(filterFn: (user: User) => boolean): Promise<User | undefined> {
    return this.users.find(filterFn);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
