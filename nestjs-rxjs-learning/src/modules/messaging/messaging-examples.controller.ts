/**
 * Messaging Examples Controller — Learning Endpoints
 */
import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MessagingExamplesService } from './messaging-examples.service';

@ApiTags('Messaging (Kafka & MQTT Learning)')
@Controller('messaging')
@Public()
export class MessagingExamplesController {
  constructor(private readonly service: MessagingExamplesService) {}

  @Get('kafka-vs-mqtt')
  @ApiOperation({ summary: 'Bài 1: So sánh Kafka vs MQTT' })
  kafkaVsMqtt() {
    return this.service.getKafkaVsMqtt();
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Bài 2: @MessagePattern vs @EventPattern' })
  messagePatterns() {
    return this.service.getMessagePatterns();
  }

  @Post('pub-sub-demo')
  @ApiOperation({ summary: 'Bài 3: Demo Publish/Subscribe' })
  pubSubDemo() {
    return this.service.demoPubSub();
  }

  @Get('dlq-idempotency')
  @ApiOperation({ summary: 'Bài 4: Dead Letter Queue & Idempotency' })
  dlqIdempotency() {
    return this.service.getDlqAndIdempotency();
  }
}
