import ky from 'ky';
import { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import debounce from 'lodash.debounce';

import { createChart } from './helpers/graph';
import { createBrush } from './helpers/brush';

export const App = () => {
	const [data, setData] = useState<any[]>([]);
	const [currentTemperature, setCurrentTemperature] = useState<any>([]);
	const [navigatorData, setNavigatorData] = useState<any[]>([]);
	const [view, setView] = useState<[Date, Date]>();
	const svgRef = useRef(null);

	useEffect(() => {
		updateCurrentTemperature();
		updateRangeView();

		setInterval(() => {
			updateCurrentTemperature();
			updateRangeView();
			updateView();
		}, 60_000);
	}, []);

	useEffect(() => updateView(), [view]);

	const updateRangeView = () => {
		ky.get('/api/v1/sensors/kontich-temperature', {
			searchParams: {
				field: 'temperature',
				rangeStart: '-1mo',
				sample: '5',
			},
		})
			.json()
			.then((values) => setNavigatorData(values as any[]));
	};

	const updateCurrentTemperature = () => {
		ky.get('/api/v1/sensors/kontich-temperature', {
			searchParams: {
				field: 'temperature',
				rangeStart: '-10m',
			},
		})
			.json<any[]>()
			.then((value) => {
				setCurrentTemperature(value[value.length - 1]);
			});
	};

	const updateView = () => {
		ky.get('/api/v1/sensors/kontich-temperature', {
			searchParams: {
				field: 'temperature',
				rangeStart: view?.[0].toISOString() || '-24h',
				...(view?.[1].toISOString() && { rangeStop: view?.[1].toISOString() }),
			},
		})
			.json()
			.then((values) => setData(values as any[]));
	};

	const handleBrushSelection = (range: [Date, Date]) => {
		console.log('set view');
		setView(range);
	};

	const brush = useMemo(() => createBrush(navigatorData, svgRef, handleBrushSelection), [navigatorData]);

	return (
		<div style={{ width: '100%' }}>
			<h1>
				Het is nu <span>{currentTemperature._value}°C</span>
			</h1>
			{createChart(data)}
			{brush}
		</div>
	);
};

export default App;
