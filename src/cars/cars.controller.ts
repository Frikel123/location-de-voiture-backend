import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('cars')
export class CarsController {
  private readonly logger = new Logger(CarsController.name);

  constructor(private carsService: CarsService) {}

  @Get()
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(+id);
  }

  // @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    this.logger.log(
      `POST /cars received: name=${body?.name ?? '[missing]'}, price=${body?.price ?? '[missing]'}, imageBytes=${
        typeof body?.image === 'string' ? Buffer.byteLength(body.image, 'utf8') : 0
      }`,
    );
    return this.carsService.create(body);
  }

  // @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    this.logger.log(
      `PUT /cars/${id} received: name=${body?.name ?? '[missing]'}, price=${body?.price ?? '[missing]'}, imageBytes=${
        typeof body?.image === 'string' ? Buffer.byteLength(body.image, 'utf8') : 0
      }`,
    );
    return this.carsService.update(+id, body);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carsService.delete(+id);
  }
}
