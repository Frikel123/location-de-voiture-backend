import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from '../bookings/booking.entity';

const carImagesTransformer = {
  to: (images: string[] | null) => (images && images.length > 0 ? JSON.stringify(images) : null),
  from: (value: string | string[] | null) => {
    if (!value) return null;
    if (Array.isArray(value)) return value;

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((image): image is string => typeof image === 'string' && image.trim().length > 0);
      }
      return typeof parsed === 'string' && parsed.trim().length > 0 ? [parsed] : null;
    } catch {
      return value.trim().length > 0 ? [value] : null;
    }
  },
};

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  price: number;

  @Column({ type: 'longtext', nullable: true })
  image: string | null;

  @Column({ type: 'longtext', nullable: true, transformer: carImagesTransformer })
  images: string[] | null;

  @OneToMany(() => Booking, (booking) => booking.car)
  bookings: Booking[];
}
