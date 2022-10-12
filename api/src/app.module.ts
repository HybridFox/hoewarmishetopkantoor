import { Module } from '@nestjs/common';

import { SensorModule } from './modules/sensor/sensor.module';

@Module({
	imports: [SensorModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
