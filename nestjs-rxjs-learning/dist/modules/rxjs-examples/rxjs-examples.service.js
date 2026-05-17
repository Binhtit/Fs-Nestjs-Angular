"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RxjsExamplesService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let RxjsExamplesService = class RxjsExamplesService {
    async observableVsPromise() {
        const observableResult = await (0, rxjs_1.lastValueFrom)(new rxjs_1.Observable((subscriber) => {
            subscriber.next(1);
            subscriber.next(2);
            subscriber.next(3);
            subscriber.complete();
        }).pipe((0, operators_1.toArray)()));
        const promiseResult = await Promise.resolve(42);
        return {
            concept: 'Observable vs Promise',
            explanation: `
        OBSERVABLE:
        - LAZY: Chỉ chạy khi có subscriber (.subscribe() hoặc NestJS tự subscribe)
        - NHIỀU GIÁ TRỊ: Emit 0, 1, hoặc N giá trị theo thời gian
        - HỦY ĐƯỢC: Có thể unsubscribe() để dừng nhận data
        - CÓ OPERATORS: pipe(map, filter, ...) để transform stream

        PROMISE:
        - EAGER: Chạy ngay khi tạo (new Promise(...))
        - 1 GIÁ TRỊ: Resolve 1 lần hoặc reject 1 lần
        - KHÔNG HỦY ĐƯỢC: Không thể cancel Promise đang chạy
        - KHÔNG CÓ OPERATORS: Chỉ có .then(), .catch(), .finally()
      `,
            codeExample: `
// Observable - emit nhiều giá trị
const obs$ = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

// Các cách tạo Observable nhanh:
of(1, 2, 3);              // Emit từng giá trị rồi complete
from([1, 2, 3]);           // Từ array/Promise/iterable
from(fetch('/api'));        // Từ Promise
interval(1000);            // Emit 0, 1, 2, ... mỗi giây
timer(2000);               // Emit 0 sau 2 giây
      `,
            result: {
                observableEmitsMultipleValues: observableResult,
                promiseEmitsSingleValue: promiseResult,
            },
            commonMistakes: [
                'Quên subscribe → Observable không chạy (lazy)',
                'Quên unsubscribe → memory leak (nhất là interval)',
                'Dùng Promise cho stream data (WebSocket) → chỉ nhận được 1 message',
            ],
            whenToUse: 'Observable cho: events, WebSocket, HTTP interceptors, stream data. Promise cho: single async operation đơn giản.',
        };
    }
    async pipeOperators() {
        const result = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.of)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe((0, operators_1.filter)((n) => n % 2 === 0), (0, operators_1.map)((n) => n * 10), (0, operators_1.reduce)((acc, val) => acc + val, 0)));
        return {
            concept: 'pipe() và Transformation Operators',
            explanation: `
        pipe(): Chain nhiều operators lại với nhau
        Mỗi operator nhận Observable → trả về Observable mới (immutable)

        filter(predicate): Chỉ cho qua giá trị thỏa điều kiện
        map(transform): Biến đổi mỗi giá trị
        reduce(accumulator, seed): Tích lũy tất cả giá trị thành 1
        tap(sideEffect): Nhìn giá trị mà không thay đổi (logging)
      `,
            codeExample: `
of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe(
  filter(n => n % 2 === 0),   // [2, 4, 6, 8, 10]
  map(n => n * 10),            // [20, 40, 60, 80, 100]
  reduce((acc, val) => acc + val, 0)  // 300
);`,
            result: { inputRange: '1-10', afterFilter: 'số chẵn', afterMap: 'x10', finalReduce: result },
            commonMistakes: [
                'Dùng map() nhưng quên return → emit undefined',
                'Nhầm tap() với map(): tap không thay đổi data, map thay đổi',
                'Đặt filter() sau map() → filter trên data đã transform (logic sai)',
            ],
            whenToUse: 'Mọi lúc cần transform data trong Observable stream',
        };
    }
    async higherOrderMapping() {
        const fetchUser = (id) => (0, rxjs_1.of)({ id, name: `User ${id}` }).pipe((0, operators_1.delay)(100));
        const mergeResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.from)([1, 2, 3]).pipe((0, operators_1.mergeMap)((id) => fetchUser(id)), (0, operators_1.toArray)()));
        const concatResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.from)([1, 2, 3]).pipe((0, operators_1.concatMap)((id) => fetchUser(id)), (0, operators_1.toArray)()));
        return {
            concept: 'Higher-Order Mapping Operators',
            explanation: `
        Đây là 4 operators QUAN TRỌNG NHẤT trong RxJS.
        Tất cả đều: Nhận giá trị → tạo Observable mới → "flatten" vào stream chính.
        Khác nhau ở CÁCH XỬ LÝ khi Observable mới đến trong khi cái cũ chưa xong:

        mergeMap:   Chạy SONG SONG tất cả, không hủy cái nào
        switchMap:  HỦY cái cũ, chỉ giữ cái MỚI NHẤT
        concatMap:  Chạy TUẦN TỰ, đợi cái trước xong mới chạy cái sau
        exhaustMap: BỎ QUA cái mới nếu cái cũ chưa xong
      `,
            codeExample: `
// mergeMap - Song song (download nhiều file cùng lúc)
from([1, 2, 3]).pipe(mergeMap(id => fetchUser(id)))

// switchMap - Hủy cũ (search autocomplete - chỉ quan tâm kết quả mới nhất)
searchInput$.pipe(switchMap(term => searchAPI(term)))

// concatMap - Tuần tự (gửi message chat - phải đúng thứ tự)
messages$.pipe(concatMap(msg => sendToServer(msg)))

// exhaustMap - Bỏ qua mới (click submit - bỏ qua click thừa)
submitBtn$.pipe(exhaustMap(() => saveForm()))`,
            result: { mergeMap_parallel: mergeResult, concatMap_sequential: concatResult },
            commonMistakes: [
                'Dùng mergeMap cho search → race condition (kết quả cũ đến sau kết quả mới)',
                'Dùng switchMap cho form submit → hủy request đang gửi',
                'Subscribe Observable trong map() thay vì dùng xxxMap → nested subscription (anti-pattern)',
            ],
            whenToUse: 'mergeMap: parallel tasks | switchMap: chỉ cần latest | concatMap: giữ thứ tự | exhaustMap: ignore duplicate',
            vsComparison: `
        | Operator    | Cái cũ chưa xong | Cái mới đến        |
        |-------------|-------------------|---------------------|
        | mergeMap    | Giữ chạy          | Chạy song song      |
        | switchMap   | HỦY               | Chạy cái mới        |
        | concatMap   | Đợi xong          | Queue chờ           |
        | exhaustMap  | Giữ chạy          | BỎ QUA cái mới      |
      `,
        };
    }
    async subjects() {
        const subject = new rxjs_1.Subject();
        const subjectValues = [];
        subject.subscribe((v) => subjectValues.push(v));
        subject.next(1);
        subject.next(2);
        const behavior = new rxjs_1.BehaviorSubject('initial');
        const behaviorValues = [];
        behavior.next('updated');
        behavior.subscribe((v) => behaviorValues.push(v));
        behavior.next('final');
        const replay = new rxjs_1.ReplaySubject(2);
        replay.next(1);
        replay.next(2);
        replay.next(3);
        const replayValues = [];
        replay.subscribe((v) => replayValues.push(v));
        return {
            concept: 'Subject, BehaviorSubject, ReplaySubject',
            explanation: `
        Subject là Observable + Observer cùng lúc:
        - Observable: Có thể subscribe() để nhận data
        - Observer: Có thể next() để emit data
        → Hoạt động như "event bus" để broadcast data

        Subject:         Subscriber chỉ nhận data EMIT SAU khi subscribe
        BehaviorSubject: Subscriber nhận GIÁI TRỊ HIỆN TẠI ngay khi subscribe + data mới
        ReplaySubject:   Subscriber nhận N GIÁ TRỊ GẦN NHẤT + data mới
      `,
            codeExample: `
// Subject - Event bus
const event$ = new Subject<string>();
event$.subscribe(msg => console.log(msg));
event$.next('Hello');  // console: 'Hello'

// BehaviorSubject - State management (giống Pinia/Redux)
const currentUser$ = new BehaviorSubject<User | null>(null);
currentUser$.next(loggedInUser);
// Component mới subscribe → nhận user hiện tại NGAY

// ReplaySubject - Chat history (replay N tin nhắn gần nhất)
const chat$ = new ReplaySubject<Message>(50);`,
            result: {
                subject: { subscribedBefore: true, received: subjectValues },
                behaviorSubject: { subscribedAfterEmit: true, received: behaviorValues },
                replaySubject: { buffer: 2, emitted: [1, 2, 3], received: replayValues },
            },
            commonMistakes: [
                'Dùng Subject cho state → subscriber mới không có giá trị ban đầu',
                'BehaviorSubject PHẢI có giá trị khởi tạo → lỗi nếu quên',
                'ReplaySubject buffer quá lớn → memory leak',
                'Quên complete() Subject → subscriber không bao giờ complete',
            ],
            whenToUse: 'Subject: events/notifications | BehaviorSubject: state management | ReplaySubject: cần replay history',
        };
    }
    async combiningStreams() {
        const forkJoinResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.forkJoin)({
            user: (0, rxjs_1.of)({ name: 'John' }).pipe((0, operators_1.delay)(100)),
            posts: (0, rxjs_1.of)([{ title: 'Post 1' }]).pipe((0, operators_1.delay)(50)),
            settings: (0, rxjs_1.of)({ theme: 'dark' }).pipe((0, operators_1.delay)(75)),
        }));
        const combineResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.combineLatest)([(0, rxjs_1.of)('A').pipe((0, operators_1.delay)(10)), (0, rxjs_1.of)(1).pipe((0, operators_1.delay)(20))]));
        const zipResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.zip)((0, rxjs_1.of)('x', 'y', 'z'), (0, rxjs_1.of)(1, 2, 3)).pipe((0, operators_1.toArray)()));
        return {
            concept: 'combineLatest, forkJoin, zip',
            explanation: `
        forkJoin:      Đợi TẤT CẢ Observable COMPLETE → emit kết quả cuối cùng
                       Giống Promise.all() cho Observable
        combineLatest: Emit combo mới nhất MỖI KHI bất kỳ source nào emit
                       Cần TẤT CẢ sources emit ít nhất 1 lần
        zip:           Ghép theo thứ tự INDEX → emit tuple
                       Source 1 emit lần 1 + Source 2 emit lần 1 → [val1, val2]
      `,
            codeExample: `
// forkJoin - Load page data (tất cả API phải xong)
forkJoin({
  user: this.http.get('/user'),
  posts: this.http.get('/posts'),
}).subscribe(({ user, posts }) => { ... });

// combineLatest - Form validation (check MỖI KHI input thay đổi)
combineLatest([email$, password$]).pipe(
  map(([email, pwd]) => isValid(email) && isValid(pwd))
);

// zip - Ghép data theo cặp
zip(names$, scores$).pipe(
  map(([name, score]) => ({ name, score }))
);`,
            result: { forkJoin: forkJoinResult, combineLatest: combineResult, zip: zipResult },
            commonMistakes: [
                'forkJoin với Observable KHÔNG COMPLETE (vd: interval) → không bao giờ emit',
                'combineLatest emit quá nhiều khi có nhiều sources → cần debounce',
                'zip bị block nếu 1 source emit nhanh hơn → buffer memory',
            ],
            whenToUse: 'forkJoin: parallel API calls | combineLatest: reactive form | zip: ghép data cặp',
        };
    }
    async errorHandling() {
        const catchResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.throwError)(() => new Error('API failed')).pipe((0, operators_1.catchError)((err) => (0, rxjs_1.of)({ fallback: true, error: err.message }))));
        let attempt = 0;
        const retryResult = await (0, rxjs_1.lastValueFrom)(new rxjs_1.Observable((subscriber) => {
            attempt++;
            if (attempt < 3) {
                subscriber.error(new Error(`Attempt ${attempt} failed`));
            }
            else {
                subscriber.next(`Success on attempt ${attempt}`);
                subscriber.complete();
            }
        }).pipe((0, operators_1.retry)(3)));
        return {
            concept: 'Error Handling: catchError, retry',
            explanation: `
        Error trong Observable DỪNG stream (giống throw trong sync code)
        catchError(): Bắt error → return Observable thay thế hoặc re-throw
        retry(n):     Tự động re-subscribe N lần khi error
        
        ERROR PROPAGATION:
        source$.pipe(op1, op2, catchError) 
        → Error ở op1 hoặc op2 đều bị catchError bắt
        → Nếu không có catchError → error propagate lên subscriber
      `,
            codeExample: `
// catchError - Fallback value khi API lỗi
this.http.get('/api/data').pipe(
  catchError(err => {
    console.error('API failed:', err);
    return of([]); // Trả về array rỗng thay vì crash
  })
);

// retry - Tự động retry khi network flaky
this.http.get('/api/data').pipe(
  retry(3),  // Thử tối đa 3 lần
  catchError(err => of({ error: 'Đã thử 3 lần vẫn lỗi' }))
);`,
            result: { catchError: catchResult, retry: { attempts: attempt, result: retryResult } },
            commonMistakes: [
                'catchError KHÔNG return Observable → TypeError',
                'retry vô hạn retry(Infinity) → DDoS chính server mình',
                'catchError rồi re-throw nhưng quên dùng throwError() → swallow error',
            ],
            whenToUse: 'catchError: fallback, transform error | retry: network retry | retryWhen: retry với delay',
        };
    }
    async rateLimiting() {
        const debounceResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.concat)((0, rxjs_1.of)('H').pipe((0, operators_1.delay)(0)), (0, rxjs_1.of)('He').pipe((0, operators_1.delay)(50)), (0, rxjs_1.of)('Hel').pipe((0, operators_1.delay)(50)), (0, rxjs_1.of)('Hell').pipe((0, operators_1.delay)(50)), (0, rxjs_1.of)('Hello').pipe((0, operators_1.delay)(400))).pipe((0, operators_1.debounceTime)(300), (0, operators_1.toArray)()));
        const throttleResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.interval)(100).pipe((0, operators_1.take)(10), (0, operators_1.throttleTime)(300), (0, operators_1.toArray)()));
        return {
            concept: 'debounceTime, throttleTime',
            explanation: `
        debounceTime(ms): Đợi khoảng "im lặng" → rồi mới emit giá trị cuối
                          Giống: Người gõ search, đợi ngừng gõ mới search
        throttleTime(ms): Emit giá trị đầu tiên, bỏ qua trong khoảng thời gian
                          Giống: Scroll event, chỉ xử lý mỗi 300ms

        KHÁC NHAU:
        debounce: Emit giá trị CUỐI sau khi ngừng
        throttle: Emit giá trị ĐẦU rồi chờ
      `,
            codeExample: `
// debounceTime - Search autocomplete
searchInput$.pipe(
  debounceTime(300),           // Đợi user ngừng gõ 300ms
  distinctUntilChanged(),      // Bỏ qua nếu giá trị không đổi
  switchMap(term => searchAPI(term))
);

// throttleTime - Scroll handler
scroll$.pipe(
  throttleTime(200),           // Tối đa 5 lần/giây
  map(event => event.target.scrollTop)
);`,
            result: {
                debounceTime: { input: 'H→He→Hel→Hell→(pause)→Hello', output: debounceResult },
                throttleTime: { input: '0-9 mỗi 100ms', output: throttleResult },
            },
            commonMistakes: [
                'debounceTime cho button click → user phải đợi → UX kém (dùng exhaustMap)',
                'throttleTime quá lớn → bỏ qua nhiều event → UI lag',
                'Nhầm debounce với throttle → search không trigger hoặc trigger quá nhiều',
            ],
            whenToUse: 'debounce: search input, resize | throttle: scroll, mousemove, window resize',
        };
    }
    async unsubscribePatterns() {
        const takeResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.of)(1, 2, 3, 4, 5).pipe((0, operators_1.take)(3), (0, operators_1.toArray)()));
        const firstResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.of)(10, 20, 30).pipe((0, operators_1.first)()));
        const takeWhileResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.of)(1, 2, 3, 4, 5, 1, 2).pipe((0, operators_1.takeWhile)((n) => n < 4), (0, operators_1.toArray)()));
        const stop$ = (0, rxjs_1.timer)(250);
        const takeUntilResult = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.interval)(100).pipe((0, operators_1.takeUntil)(stop$), (0, operators_1.toArray)()));
        return {
            concept: 'Unsubscribe Patterns: takeUntil, takeWhile, take, first',
            explanation: `
        MEMORY LEAK là lỗi phổ biến nhất khi dùng RxJS!
        Observable KHÔNG tự unsubscribe → phải chủ động dừng.

        take(n):        Lấy N giá trị rồi auto-complete
        first():        Lấy giá trị đầu tiên (= take(1))
        takeWhile(fn):  Lấy while condition true, dừng khi false
        takeUntil(obs): Lấy cho đến khi Observable khác emit
      `,
            codeExample: `
// takeUntil - Pattern phổ biến nhất trong Angular/NestJS
// Dùng Subject làm "destroy signal"
private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)   // Tự unsubscribe khi destroy$ emit
  ).subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}`,
            result: {
                take3: takeResult,
                first: firstResult,
                takeWhileLessThan4: takeWhileResult,
                takeUntil250ms: takeUntilResult,
            },
            commonMistakes: [
                'Quên unsubscribe interval/timer → chạy mãi → memory leak',
                'Subscribe trong subscribe → khó track unsubscribe (dùng xxxMap thay thế)',
                'takeWhile với điều kiện luôn true → không bao giờ dừng',
            ],
            whenToUse: 'takeUntil: component lifecycle | take: lấy N giá trị | first: chỉ cần 1 giá trị',
        };
    }
    async realWorldWebSocket() {
        return {
            concept: 'WebSocket + RxJS (Real-world Pattern)',
            explanation: `
        WebSocket + RxJS là combo mạnh cho real-time apps:
        - WebSocket emit events liên tục → hoàn hảo cho Observable
        - RxJS operators filter/transform events
        - Subject broadcast events đến nhiều subscribers

        PATTERN trong NestJS:
        1. RealtimeService: Subject làm event bus
        2. RealtimeGateway: Subscribe Subject → emit đến WebSocket clients
        3. Bất kỳ Service nào: Inject RealtimeService → push events
      `,
            codeExample: `
// Service - Event bus với Subject
@Injectable()
export class RealtimeService {
  private events$ = new Subject<{event: string, data: any}>();

  emit(event: string, data: any) {
    this.events$.next({ event, data });
  }

  getStream() {
    return this.events$.asObservable();
  }
}

// Gateway - Subscribe và broadcast
@WebSocketGateway()
export class AppGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private realtime: RealtimeService) {}

  afterInit() {
    this.realtime.getStream().pipe(
      // Filter chỉ lấy notification events
      filter(e => e.event === 'notification'),
      // Throttle tránh spam
      throttleTime(1000),
    ).subscribe(({ event, data }) => {
      this.server.emit(event, data);
    });
  }
}`,
            result: {
                message: 'Xem module src/modules/realtime/ để thấy implementation thực tế',
                endpoint: 'WebSocket: ws://localhost:3000',
                events: ['task:created', 'task:updated', 'notification'],
            },
            commonMistakes: [
                'Không unsubscribe khi Gateway destroy → memory leak',
                'Emit quá nhiều events → client overload (cần throttle)',
                'Không handle reconnection → client mất kết nối = mất events',
            ],
            whenToUse: 'Chat, notifications, live dashboard, collaborative editing',
        };
    }
};
exports.RxjsExamplesService = RxjsExamplesService;
exports.RxjsExamplesService = RxjsExamplesService = __decorate([
    (0, common_1.Injectable)()
], RxjsExamplesService);
//# sourceMappingURL=rxjs-examples.service.js.map