import { Injectable, Logger, MessageEvent, NotFoundException } from "@nestjs/common";
import { Placeholders } from "../types/placeholder-types";
import { Observable, Subject } from "rxjs";
import { randomUUID } from "node:crypto";

export interface JobState<T = any> {
    id: string;
    status: Placeholders.AuthStatus;
    progress?: number;
    data?: T;
    err?: string;
}

@Injectable()
export class JobManagerService {

    private readonly logger = new Logger(JobManagerService.name);
    //{jobid,subject}
    private readonly jobStreams = new Map<string, Subject<MessageEvent>>();
    //{jobid,jobstate}
    private readonly jobStates = new Map<string, JobState>()

    createJob(): string {
        const jobId = randomUUID();
        const subject = new Subject<MessageEvent>();

        this.jobStreams.set(jobId, subject);
        this.jobStates.set(jobId, { id: jobId, status: Placeholders.AuthStatus.WAITING })

        return jobId;
    }

    emitProgress(jobId: string, eventName: string, payload: any = {}): void {
        const stream = this.jobStreams.get(jobId);
        if (stream) {
            stream.next({
                type: eventName,
                data: payload
            })
        }
    }

    getStream(jobId: string): Observable<MessageEvent> {
        const stream = this.jobStreams.get(jobId);

        if (!stream) {
            throw new NotFoundException('No active job found with Id ' + jobId);
        }
        return stream.asObservable();
    }

    completeJob(jobId: string, finalResult: any): void {
        const stream = this.jobStreams.get(jobId);
        if (stream) {
            stream.next({
                type: Placeholders.AuthStatus.SUCCESS,
                data: finalResult
            });
            stream.complete();
        }

        setTimeout(() => {
            this.jobStreams.delete(jobId);
            this.jobStates.delete(jobId)
            this.logger.log(`[JobManager] Job clean up ${jobId}`)
        }, 60000);
    }

    failJob(jobId: string, error: Error): void {
        const stream = this.jobStreams.get(jobId)
        if (stream) {
            stream.next({
                type: "error",
                data: { message: error?.message }
            });
            stream.complete();
        }

        setTimeout(() => {
            this.jobStreams.delete(jobId);
            this.jobStates.delete(jobId)
            this.logger.log(`[JobManager] Job clean up ${jobId}`)
        }, 60000);
    }
}