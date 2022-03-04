import { Controller, Post, Get } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { UserDto } from './dtos/users.dto';
import { User } from './interfaces/users.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  index(): User[] {
    return this.usersService.findAll();
  }

  @Post()
  @ApiBody({ type: UserDto })
  create(user: UserDto): User {
    return this.usersService.create(user);
  }
}
