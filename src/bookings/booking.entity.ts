import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Car } from '../cars/cars.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car, (car) => car.bookings, { eager: true })
  car: Car;

  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ default: 0 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
