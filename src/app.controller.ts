import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDER_SERVICE') private orderService: ClientProxy,
  ) {}

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
      //Completed Order
      this.orderService.emit('order_completed', data);
    } else {
      console.log('Inventory not available');
      channel.ack(originalMsg);
      //Canceled Order
      this.orderService.emit('order_canceled', data);
    }
  }
}
