import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Please input your email!' })
  email: string;

  @IsNotEmpty({ message: 'Please input your password!' })
  password: string;
}
