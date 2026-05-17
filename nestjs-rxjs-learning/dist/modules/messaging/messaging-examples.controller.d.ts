import { MessagingExamplesService } from './messaging-examples.service';
export declare class MessagingExamplesController {
    private readonly service;
    constructor(service: MessagingExamplesService);
    kafkaVsMqtt(): import("./messaging-examples.service").MessagingLesson;
    messagePatterns(): import("./messaging-examples.service").MessagingLesson;
    pubSubDemo(): Promise<import("./messaging-examples.service").MessagingLesson>;
    dlqIdempotency(): import("./messaging-examples.service").MessagingLesson;
}
