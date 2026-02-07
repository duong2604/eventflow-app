import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required!' })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Date is required!' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required!' })
  location: string;

  @IsInt()
  @IsNotEmpty()
  @MinLength(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  price: number;
}
