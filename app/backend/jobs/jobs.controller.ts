import { Controller, Get, Inject, Param, Sse } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JobManagerService } from "./jobs.service";

@ApiTags('Jobs')
@Controller('jobs')
export class JobController{
    constructor(
        @Inject(JobManagerService) private readonly jobManager:JobManagerService,
    ){}

    @Sse('stream')
    @ApiOperation({summary:'Global sse for all async jobs'})
    streamAll(){
        return this.jobManager.getGlobalStream();
    }

    @Get(':jobId')
    @ApiParam({name:'jobId', type:String, description:'enter the job id'})
    @ApiOperation({summary:'Get current sate of job queue'})
    getJobState(@Param('jobId') jobId:string){
        return this.jobManager.getJobState(jobId);
    }
}