import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './cars.entity';
import { In, Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Contract } from '../contracts/contract.entity';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carRepo: Repository<Car>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
  ) {}

  private normalizeImages(data: Partial<Car>) {
    if (!('image' in data) && !('images' in data)) {
      return data;
    }

    const images = Array.isArray(data.images)
      ? data.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
      : data.image
        ? [data.image]
        : null;

    return {
      ...data,
      image: images?.[0] ?? null,
      images,
    };
  }

  findAll() {
    return this.carRepo.find();
  }

  async findOne(id: number) {
    const car = await this.carRepo.findOneBy({ id });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }
   
  create(data: Partial<Car>) {
    const car = this.carRepo.create(this.normalizeImages(data));
    return this.carRepo.save(car);
  }

  async update(id: number, data: Partial<Car>) {
    const car = await this.carRepo.preload({ id, ...this.normalizeImages(data) });
    if (!car) throw new NotFoundException('Car not found');
    return this.carRepo.save(car);
  }

  async delete(id: number) {
    const car = await this.findOne(id);
    const bookings = await this.bookingRepo.find({
      where: { car: { id } },
      select: { id: true },
    });
    const bookingIds = bookings.map((booking) => booking.id);

    if (bookingIds.length > 0) {
      await this.contractRepo.delete({ bookingId: In(bookingIds) });
      await this.bookingRepo
        .createQueryBuilder()
        .delete()
        .from(Booking)
        .where('carId = :id', { id })
        .execute();
    }

    await this.carRepo.remove(car);
    return { message: 'Car deleted successfully' };
  }
}
