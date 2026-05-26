import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './contract.entity';

const buildContractToken = (contractNumber: string) =>
  contractNumber
    ? contractNumber.trim().replace(/[^a-zA-Z0-9-]/g, '-')
    : `NC-${Date.now()}`;

const buildContractQrUrl = (contractNumber: string) => {
  const publicUrl = process.env.FRONTEND_PUBLIC_URL || 'https://carsatlas.netlify.app';
  return `${publicUrl.replace(/\/$/, '')}/contracts/verify/${encodeURIComponent(contractNumber)}`;
};

const normalizeContractData = (data: CreateContractDto | UpdateContractDto) => {
  const signatureClient = data.signature || data.signatureClient || data.clientSignature;
  const signatureAdmin = data.signatureAdmin || data.agencySignature;
  const qrUrl = data.qrUrl || data.qrCode || (data.contractNumber ? buildContractQrUrl(data.contractNumber) : undefined);

  return {
    ...data,
    ...(signatureClient ? { signature: signatureClient, signatureClient, clientSignature: signatureClient } : {}),
    ...(signatureAdmin ? { signatureAdmin, agencySignature: signatureAdmin } : {}),
    ...(qrUrl ? { qrUrl, qrCode: qrUrl } : {}),
  };
};

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOneBy({ id });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }
    return contract;
  }

  async findByContractNumber(contractNumber: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: [{ contractToken: contractNumber }, { contractNumber }],
    });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }
    return contract;
  }

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const contractToken = createContractDto.contractToken || buildContractToken(createContractDto.contractNumber);
    const data = normalizeContractData(createContractDto);
    const qrUrl = data.qrUrl || buildContractQrUrl(createContractDto.contractNumber);
    const contract = this.contractRepository.create({
      ...(data as Contract),
      contractToken,
      contractStatus: createContractDto.contractStatus || createContractDto.status,
      qrUrl,
      qrCode: qrUrl,
    });
    return this.contractRepository.save(contract);
  }

  async update(id: number, updateContractDto: UpdateContractDto): Promise<Contract> {
    const contractToken =
      updateContractDto.contractToken ||
      (updateContractDto.contractNumber ? buildContractToken(updateContractDto.contractNumber) : undefined);
    const data = normalizeContractData(updateContractDto);
    const contract = await this.contractRepository.preload({
      id,
      ...data,
      ...(contractToken ? { contractToken } : {}),
      contractStatus: updateContractDto.contractStatus || updateContractDto.status,
    });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }
    return this.contractRepository.save(contract);
  }

  async remove(id: number): Promise<void> {
    const result = await this.contractRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Contrat introuvable');
    }
  }
}
