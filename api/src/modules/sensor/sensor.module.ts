import { Module } from '@nestjs/common';

import { SensorController } from './controllers/sensor.controller';
// import { SensorService } from './services/sensor.service';

@Module({
	controllers: [SensorController],
	// providers: [SensorService],
})
export class SensorModule {}
