import { InfluxDB } from '@influxdata/influxdb-client';

export const influx = new InfluxDB({
	url: process.env.INFLUX_URL,
	token: process.env.INFLUX_TOKEN,
});

export const influxWriteApi = influx.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);
export const influxQueryApi = influx.getQueryApi(process.env.INFLUX_ORG);
