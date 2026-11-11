import { Injectable, Logger, MessageEvent, NotFoundException } from "@nestjs/common";
import { Placeholders } from "../common/types/placeholder-types";
import { Observable, Subject } from "rxjs";
import { randomUUID } from "node:crypto";

export interface JobState<T = any> {
    id: string;
    status: Placeholders.Status;
    progress?: number;
    data?: T;
    err?: string;
}

@Injectable()
export class JobManagerService {

    private readonly logger = new Logger(JobManagerService.name);
    private readonly globalStream = new Subject<MessageEvent>();
    private readonly jobStates = new Map<string, JobState>();
    private readonly cleanupTimers = new Map<string,NodeJS.Timeout>();

    createJob(): string {
        const jobId = randomUUID();
        this.jobStates.set(jobId, { id: jobId, status: Placeholders.Status.WAITING });
        return jobId;
    }

    getGlobalStream(): Observable<MessageEvent> {
        return this.globalStream.asObservable();
    }

    getJobState(jobId: string): JobState {
        const state = this.jobStates.get(jobId);
        if (!state) {
            throw new NotFoundException(`No job found with Id ${jobId}`);
        }
        return state;
    }

    emitProgress(jobId: string, status: Placeholders.Status, payload: any = {}): void {
        this.publishJobEvent(jobId, status, { data: payload });
    }

    completeJob(jobId: string, finalResult: any): void {
        this.publishJobEvent(jobId, Placeholders.Status.SUCCESS, { data: finalResult},{hasResult: true});
        this.scheduleCleanup(jobId);
    }

    failJob(jobId: string, error: Error): void {
        this.publishJobEvent(jobId, Placeholders.Status.FAILED, {
            err: error?.message ?? 'Unknown error',
        });
        this.scheduleCleanup(jobId);
    }

    private publishJobEvent(
        jobId: string,
        status: Placeholders.Status,
        stateExtra: { data?: any; err?: string; progress?: number } = {},
        streamExtra: { data?: any; err?: string; progress?: number; hasResult?: boolean } = stateExtra,
    ): void {
        this.jobStates.set(jobId, { id: jobId, status, ...stateExtra });
        this.globalStream.next({
            type: 'job-update',
            data: { jobId, status, ...streamExtra },
        });
    }

    private scheduleCleanup(jobId: string): void {
        const existing = this.cleanupTimers.get(jobId);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            this.cleanupTimers.delete(jobId);
            this.jobStates.delete(jobId);
            this.logger.log(`[JobManager] Job clean up ${jobId}`);
        }, 100000);

        timer.unref();
        this.cleanupTimers.set(jobId, timer);
    }
}