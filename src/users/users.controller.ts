import { Controller, Post, Get, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { UserEntity } from './database/user.entity';
import { UserDto } from './dtos/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'user',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'user-consumer',
        allowAutoTopicCreation: true,
      },
    },
  })
  private client: ClientKafka;

  async onModuleInit() {
    const requestPatters = ['find-all-users', 'create-user'];

    requestPatters.forEach(
      async (pattern) => this.client.subscribeToResponseOf(pattern),
      await this.client.connect(),
    );
  }

  constructor(private readonly usersService: UsersService) {}

  @Get()
  index(): Observable<UserEntity[]> {
    return this.client.send('find-all-users', {});
  }

  @Post()
  @ApiBody({ type: UserDto })
  create(user: UserDto): Observable<UserEntity> {
    return this.client.send('create-user', user);
  }
}
