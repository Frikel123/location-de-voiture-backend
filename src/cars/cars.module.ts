import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './cars.entity';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { Booking } from '../bookings/booking.entity';
import { Contract } from '../contracts/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car, Booking, Contract])],
  providers: [CarsService],
  controllers: [CarsController],
})
export class CarsModule {}
