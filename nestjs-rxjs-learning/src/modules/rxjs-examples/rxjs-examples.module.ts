import { Module } from '@nestjs/common';
import { RxjsExamplesController } from './rxjs-examples.controller';
import { RxjsExamplesService } from './rxjs-examples.service';

@Module({
  controllers: [RxjsExamplesController],
  providers: [RxjsExamplesService],
})
export class RxjsExamplesModule {}
