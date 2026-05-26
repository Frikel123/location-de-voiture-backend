import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

const contractStatuses = ['Brouillon', 'Confirm\u00e9', 'Sign\u00e9', 'Termin\u00e9', 'Annul\u00e9'];

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  contractNumber: string;

  @IsOptional()
  @IsString()
  contractToken?: string;

  @IsOptional()
  @IsString()
  contractStatus?: string;

  @IsOptional()
  @IsString()
  qrUrl?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(contractStatuses)
  status: string;

  @IsOptional()
  @IsInt()
  bookingId?: number;

  @IsNotEmpty()
  @IsString()
  clientFullName: string;

  @IsNotEmpty()
  @IsString()
  clientPhone: string;

  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientDocumentNumber?: string;

  @IsOptional()
  @IsString()
  clientAddress?: string;

  @IsOptional()
  @IsString()
  clientLicenseNumber?: string;

  @IsOptional()
  @IsString()
  clientLicenseIssuedAt?: string;

  @IsOptional()
  @IsInt()
  carId?: number;

  @IsOptional()
  @IsString()
  carMake?: string;

  @IsOptional()
  @IsString()
  carModel?: string;

  @IsOptional()
  @IsString()
  carPlate?: string;

  @IsOptional()
  @IsString()
  carYear?: string;

  @IsOptional()
  @IsString()
  carFuel?: string;

  @IsOptional()
  @IsString()
  carColor?: string;

  @IsOptional()
  @IsInt()
  carMileage?: number;

  @IsOptional()
  @IsInt()
  reservationDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservationDailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservationDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservationTotalTTC?: number;

  @IsOptional()
  @IsString()
  reservationPaymentMethod?: string;

  @IsOptional()
  @IsString()
  reservationStartDate?: string;

  @IsOptional()
  @IsString()
  reservationEndDate?: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsString()
  agencyAddress?: string;

  @IsOptional()
  @IsString()
  agencyPhone?: string;

  @IsOptional()
  @IsString()
  insuranceName?: string;

  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @IsOptional()
  @IsBoolean()
  insuranceIncluded?: boolean;

  @IsOptional()
  @IsString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  signatureClient?: string;

  @IsOptional()
  @IsString()
  signatureAdmin?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  clientSignature?: string;

  @IsOptional()
  @IsString()
  agencySignature?: string;
}
