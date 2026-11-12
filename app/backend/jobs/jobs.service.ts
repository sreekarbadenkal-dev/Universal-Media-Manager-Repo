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

    //create a job with unique id
    createJob(): string {
        const jobId = randomUUID();
        this.jobStates.set(jobId, { id: jobId, status: Placeholders.Status.WAITING });
        return jobId;
    }

    //creating a global pipe to stream all events 
    getGlobalStream(): Observable<MessageEvent> {
        return this.globalStream.asObservable();
    }

    //get the state of the job using id
    getJobState(jobId: string): JobState {
        const state = this.jobStates.get(jobId);
        if (!state) {
            throw new NotFoundException(`No job found with Id ${jobId}`);
        }
        return state;
    }

    //emit the current state of the job
    emitProgress(jobId: string, status: Placeholders.Status, payload: any = {}): void {
        this.publishJobEvent(jobId, status, { data: payload });
    }

    //mark the job as comolete
    completeJob(jobId: string, finalResult: any): void {
        this.publishJobEvent(jobId, Placeholders.Status.SUCCESS, { data: finalResult},{hasResult: true});
        this.scheduleCleanup(jobId);
    }

    //mark the job as failure
    failJob(jobId: string, error: Error): void {
        this.publishJobEvent(jobId, Placeholders.Status.FAILED, {
            err: error?.message ?? 'Unknown error',
        });
        this.scheduleCleanup(jobId);
    }

    //put the event in the pipe
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

    //clean the events from the pipe
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