import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {

  @IsNumber()
  carId: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  phone: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}