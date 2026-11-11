import { Global, Module } from "@nestjs/common";
import { JobManagerService } from "./jobs.service";
import { JobController } from "./jobs.controller";

@Global()
@Module({
    exports:[JobManagerService],
    controllers:[JobController],
    providers:[JobManagerService],
})
export class JobModule{}
