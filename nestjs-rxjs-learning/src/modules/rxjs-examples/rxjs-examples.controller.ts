import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RxjsExamplesService } from './rxjs-examples.service';

/**
 * RxJS Learning Controller
 * Tất cả endpoints đều @Public() vì đây là learning module
 */
@ApiTags('RxJS Learning')
@Public()
@Controller('rxjs')
export class RxjsExamplesController {
  constructor(private readonly rxjsService: RxjsExamplesService) {}

  @ApiOperation({ summary: 'Bài 1: Observable vs Promise' })
  @Get('observable-vs-promise')
  lesson1() {
    return this.rxjsService.observableVsPromise();
  }

  @ApiOperation({ summary: 'Bài 2: pipe() và Transformation Operators' })
  @Get('pipe-operators')
  lesson2() {
    return this.rxjsService.pipeOperators();
  }

  @ApiOperation({ summary: 'Bài 3: mergeMap, switchMap, concatMap, exhaustMap' })
  @Get('higher-order-mapping')
  lesson3() {
    return this.rxjsService.higherOrderMapping();
  }

  @ApiOperation({ summary: 'Bài 4: Subject, BehaviorSubject, ReplaySubject' })
  @Get('subjects')
  lesson4() {
    return this.rxjsService.subjects();
  }

  @ApiOperation({ summary: 'Bài 5: combineLatest, forkJoin, zip' })
  @Get('combining-streams')
  lesson5() {
    return this.rxjsService.combiningStreams();
  }

  @ApiOperation({ summary: 'Bài 6: catchError, retry (Error Handling)' })
  @Get('error-handling')
  lesson6() {
    return this.rxjsService.errorHandling();
  }

  @ApiOperation({ summary: 'Bài 7: debounceTime, throttleTime' })
  @Get('rate-limiting')
  lesson7() {
    return this.rxjsService.rateLimiting();
  }

  @ApiOperation({ summary: 'Bài 8: takeUntil, takeWhile, take, first' })
  @Get('unsubscribe-patterns')
  lesson8() {
    return this.rxjsService.unsubscribePatterns();
  }

  @ApiOperation({ summary: 'Bài 9: WebSocket + RxJS Real-World Pattern' })
  @Get('real-world-websocket')
  lesson9() {
    return this.rxjsService.realWorldWebSocket();
  }
}
