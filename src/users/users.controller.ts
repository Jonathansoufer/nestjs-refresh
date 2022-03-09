import {
  Controller,
  Post,
  Get,
  OnModuleInit,
  Param,
  Body,
  Delete,
  Patch,
  Put,
} from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { User } from './interfaces/user.interface';
import { UserDto } from './dtos/users.dto';

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
    const requestPatters = ['find-all-users', 'find-user', 'create-user'];

    requestPatters.forEach(
      async (pattern) => this.client.subscribeToResponseOf(pattern),
      await this.client.connect(),
    );
  }

  @Get()
  index(): Observable<User[]> {
    return this.client.send('find-all-users', {});
  }

  @Get(':id')
  find(@Param('id') id: number): Observable<User> {
    return this.client.send('find-user', { id });
  }

  @Post()
  @ApiBody({ type: UserDto })
  create(user: UserDto): Observable<User> {
    return this.client.send('create-user', user);
  }

  @Put(':id')
  @ApiBody({ type: UserDto })
  update(
    @Param('id') id: number,
    @Body() { name, email, phone, password }: UserDto,
  ) {
    const payload = {
      id,
      name,
      email,
      phone,
      password,
    };

    return this.client.emit('update-user', payload);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.client.emit('delete-user', { id });
  }

  @Patch(':id/activate')
  activate(@Param('id') id: number) {
    return this.client.emit('activate-user', { id });
  }

  @Patch(':id/inactivate')
  inactivate(@Param('id') id: number) {
    return this.client.emit('inactivate-user', { id });
  }
}
