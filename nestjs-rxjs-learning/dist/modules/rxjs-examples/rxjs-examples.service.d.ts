export interface RxjsLessonResponse {
    concept: string;
    explanation: string;
    codeExample: string;
    result: unknown;
    commonMistakes: string[];
    whenToUse: string;
    vsComparison?: string;
}
export declare class RxjsExamplesService {
    observableVsPromise(): Promise<RxjsLessonResponse>;
    pipeOperators(): Promise<RxjsLessonResponse>;
    higherOrderMapping(): Promise<RxjsLessonResponse>;
    subjects(): Promise<RxjsLessonResponse>;
    combiningStreams(): Promise<RxjsLessonResponse>;
    errorHandling(): Promise<RxjsLessonResponse>;
    rateLimiting(): Promise<RxjsLessonResponse>;
    unsubscribePatterns(): Promise<RxjsLessonResponse>;
    realWorldWebSocket(): Promise<RxjsLessonResponse>;
}
