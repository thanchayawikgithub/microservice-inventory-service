import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('order_created')
  handleOrderCreate(@Payload() data: any, @Ctx() context: RmqContext) {
    const originalMsg = context.getMessage();
    const channel = context.getChannelRef();
    console.log('Order received for processing:', data);
    const isInStock = true;
    if (isInStock) {
      console.log('Inventory available. Processing order');
      channel.ack(originalMsg);
    } else {
      console.log('Inventory not available');
      channel.ack(originalMsg);
    }
  }
}
