/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { IMidwayApplication } from "@midwayjs/core";
/**
 * 事件
 */
export declare class CoolEventManager extends EventEmitter {
    app: IMidwayApplication;
    init(): Promise<void>;
    handlerEvent(module: any): Promise<void>;
}
