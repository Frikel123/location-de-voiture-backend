import { Controller, Post, Body, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: any) {
    return this.bookingsService.create(body);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }
}