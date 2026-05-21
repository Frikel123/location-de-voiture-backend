import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Car } from '../cars/cars.entity';
import { Contract } from '../contracts/contract.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Car)
    private carRepo: Repository<Car>,
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
  ) {}

  private getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private assertValidBookingDates(startDate: string, endDate: string, allowPastStartDate = false) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      throw new BadRequestException('Dates must use yyyy-MM-dd format');
    }

    if (!allowPastStartDate && startDate < this.getTodayKey()) {
      throw new BadRequestException('startDate cannot be before today');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }

  private getDays(startDate: string, endDate: string, allowPastStartDate = false) {
    this.assertValidBookingDates(startDate, endDate, allowPastStartDate);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (!Number.isFinite(days) || days <= 0) throw new BadRequestException('Invalid booking dates');
    return days;
  }

  private buildContractNumber(bookingId: number) {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    return `NC-${ymd}-${String(bookingId).padStart(5, '0')}`;
  }

  private buildContractToken(contractNumber: string) {
    return contractNumber.trim().replace(/[^a-zA-Z0-9-]/g, '-');
  }

  private buildContractQrUrl(contractNumber: string) {
    const publicUrl = process.env.FRONTEND_PUBLIC_URL || 'http://192.168.1.8:8080';
    return `${publicUrl.replace(/\/$/, '')}/contracts/verify/${encodeURIComponent(contractNumber)}`;
  }

  private splitCarName(carName: string) {
    const [make, ...model] = carName.split(' ');
    return {
      make: make || carName,
      model: model.join(' ') || carName,
    };
  }

  private async createContractFromBooking(booking: Booking) {
    const existing = await this.contractRepo.findOneBy({ bookingId: booking.id });
    if (existing) return existing;

    const carName = this.splitCarName(booking.car?.name ?? '');
    const days = this.getDays(booking.startDate, booking.endDate, true);
    const contractNumber = this.buildContractNumber(booking.id);
    const contractToken = this.buildContractToken(contractNumber);
    const contractStatus = 'Confirm\u00e9';
    const contract = this.contractRepo.create({
      bookingId: booking.id,
      contractNumber,
      contractToken,
      contractStatus,
      qrUrl: this.buildContractQrUrl(contractNumber),
      qrCode: this.buildContractQrUrl(contractNumber),
      status: contractStatus,
      carId: booking.car?.id,
      clientFullName: booking.customerName,
      clientPhone: booking.phone,
      clientEmail: '',
      clientDocumentNumber: '',
      clientAddress: '',
      clientLicenseNumber: '',
      clientLicenseIssuedAt: '',
      carMake: carName.make,
      carModel: carName.model,
      carPlate: '',
      carYear: '',
      carFuel: '',
      carColor: '',
      carMileage: 0,
      reservationStartDate: booking.startDate,
      reservationEndDate: booking.endDate,
      reservationDays: days,
      reservationDailyRate: Number(booking.car?.price ?? 0),
      reservationDeposit: 0,
      reservationTotalTTC: Number(booking.totalPrice ?? 0),
      reservationPaymentMethod: 'Esp\u00e8ces',
      agencyName: 'NAYS CAR',
      agencyAddress: 'Casablanca, Maroc',
      agencyPhone: '+212 6 00 00 00 00',
      insuranceName: 'Assurance tous risques',
      insurancePolicyNumber: '',
      insuranceIncluded: true,
      notes: 'Contrat genere automatiquement depuis la reservation.',
    });

    return this.contractRepo.save(contract);
  }

  async create(data: any) {
    const car = await this.carRepo.findOneBy({ id: data.carId });
    if (!car) throw new NotFoundException('Car not found');

    const days = this.getDays(data.startDate, data.endDate);

    const booking = this.bookingRepo.create({
      car,
      customerName: data.customerName,
      phone: data.phone,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: days * car.price,
    });

    const savedBooking = await this.bookingRepo.save(booking);
    await this.createContractFromBooking(savedBooking);
    return savedBooking;
  }

  findAll() {
    return this.bookingRepo.find({ relations: ['car'] });
  }

  async update(id: number, data: any) {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['car'] });
    if (!booking) throw new NotFoundException('Booking not found');

    const car = data.carId ? await this.carRepo.findOneBy({ id: data.carId }) : booking.car;
    if (!car) throw new NotFoundException('Car not found');

    const startDate = data.startDate ?? booking.startDate;
    const endDate = data.endDate ?? booking.endDate;
    const days = this.getDays(startDate, endDate, true);

    booking.car = car;
    booking.customerName = data.customerName ?? booking.customerName;
    booking.phone = data.phone ?? booking.phone;
    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.totalPrice = days * car.price;

    const savedBooking = await this.bookingRepo.save(booking);
    const contract = await this.contractRepo.findOneBy({ bookingId: savedBooking.id });
    if (contract) {
      const carName = this.splitCarName(savedBooking.car?.name ?? '');
      const contractToken = contract.contractToken || this.buildContractToken(contract.contractNumber);
      contract.clientFullName = savedBooking.customerName;
      contract.clientPhone = savedBooking.phone;
      contract.contractToken = contractToken;
      contract.contractStatus = contract.contractStatus || contract.status;
      const qrUrl = this.buildContractQrUrl(contract.contractNumber);
      contract.qrUrl = contract.qrUrl || qrUrl;
      contract.qrCode = contract.qrCode || qrUrl;
      contract.carId = savedBooking.car?.id;
      contract.carMake = contract.carMake || carName.make;
      contract.carModel = contract.carModel || carName.model;
      contract.reservationStartDate = savedBooking.startDate;
      contract.reservationEndDate = savedBooking.endDate;
      contract.reservationDays = days;
      contract.reservationDailyRate = Number(savedBooking.car?.price ?? 0);
      contract.reservationTotalTTC = Number(savedBooking.totalPrice ?? 0);
      await this.contractRepo.save(contract);
    } else {
      await this.createContractFromBooking(savedBooking);
    }

    return savedBooking;
  }

  async delete(id: number) {
    const booking = await this.bookingRepo.findOneBy({ id });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.bookingRepo.remove(booking);
    return { message: 'Booking deleted successfully' };
  }
}
