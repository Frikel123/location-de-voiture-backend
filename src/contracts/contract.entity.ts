import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contractNumber: string;

  @Column({ default: 'Brouillon' })
  status: string;

  @Column({ nullable: true, unique: true })
  contractToken: string;

  @Column({ nullable: true })
  contractStatus: string;

  @Column({ type: 'text', nullable: true })
  qrUrl: string;

  @Column({ type: 'text', nullable: true, name: 'qr_code' })
  qrCode: string;

  @Column({ nullable: true })
  bookingId: number;

  @Column()
  clientFullName: string;

  @Column()
  clientPhone: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column({ nullable: true })
  clientDocumentNumber: string;

  @Column({ nullable: true })
  clientAddress: string;

  @Column({ nullable: true })
  clientLicenseNumber: string;

  @Column({ nullable: true })
  clientLicenseIssuedAt: string;

  @Column({ nullable: true })
  carId: number;

  @Column({ nullable: true })
  carMake: string;

  @Column({ nullable: true })
  carModel: string;

  @Column({ nullable: true })
  carPlate: string;

  @Column({ nullable: true })
  carYear: string;

  @Column({ nullable: true })
  carFuel: string;

  @Column({ nullable: true })
  carColor: string;

  @Column({ type: 'int', default: 0 })
  carMileage: number;

  @Column({ nullable: true })
  reservationStartDate: string;

  @Column({ nullable: true })
  reservationEndDate: string;

  @Column({ type: 'int', default: 0 })
  reservationDays: number;

  @Column({ type: 'float', default: 0 })
  reservationDailyRate: number;

  @Column({ type: 'float', default: 0 })
  reservationDeposit: number;

  @Column({ type: 'float', default: 0 })
  reservationTotalTTC: number;

  @Column({ nullable: true })
  reservationPaymentMethod: string;

  @Column({ nullable: true })
  agencyName: string;

  @Column({ nullable: true })
  agencyAddress: string;

  @Column({ nullable: true })
  agencyPhone: string;

  @Column({ nullable: true })
  insuranceName: string;

  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @Column({ default: true })
  insuranceIncluded: boolean;

  @Column({ nullable: true })
  signedAt: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  signatureClient: string;

  @Column({ type: 'text', nullable: true })
  signatureAdmin: string;

  @Column({ type: 'text', nullable: true, name: 'client_signature' })
  clientSignature: string;

  @Column({ type: 'text', nullable: true, name: 'agency_signature' })
  agencySignature: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
