import { Point } from '@influxdata/influxdb-client';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';

import { influxQueryApi, influxWriteApi } from '../../../shared/instances/influx';

@Controller('v1/sensors')
export class SensorController {
	@Get(':sensorId')
	public async getSensorData(
		@Param('sensorId') sensorId: string,
		@Query('field') field: string,
		@Query('rangeStart') rangeStart = '-1d',
		@Query('rangeStop') rangeStop,
		@Query('sample') sample,
	) {
		const query = `from(bucket:"${process.env.INFLUX_BUCKET}")
			|> range(start: ${rangeStart}${rangeStop ? `, stop: ${rangeStop}` : ''})
			|> filter(fn: (r) => r._measurement == "${sensorId}" and r._field == "${field}")
			|> sort(columns: ["_time"])
			${sample ? `|> sample(n: ${sample}, pos: 1)` : ''}`;

		return influxQueryApi.collectRows(query);
	}

	@Put(':sensorId')
	public writeSensorData(@Param('sensorId') sensorId: string, @Body() body) {
		console.log(sensorId, body);
		const point = new Point(sensorId)
			.floatField('temperature', body.temperature)
			.floatField('pressure', body.pressure)
			.timestamp(new Date());
		influxWriteApi.writePoint(point);
	}
}
