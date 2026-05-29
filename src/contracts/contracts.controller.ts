import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
// import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  findAll() {
    return this.contractsService.findAll();
  }

  @Get('verify/:contractNumber')
  verify(@Param('contractNumber') contractNumber: string) {
    return this.contractsService.findByContractNumber(contractNumber);
  }

  @Get('signature/:id')
  findPublicSignatureContract(@Param('id') id: string) {
    return this.contractsService.findByContractNumber(id);
  }

  @Post('signature/:id')
  sign(@Param('id') id: string, @Body('signature') signature: string, @Req() request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
    return this.contractsService.sign(id, signature, ipAddress || request.ip);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Post()
  // @UseGuards(JwtAuthGuard)
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}
