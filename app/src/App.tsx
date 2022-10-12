import ky from 'ky';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from 'recharts';

export const App = () => {
	const [data, setData] = useState<any[]>([]);

	const fetchData = ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
		console.log(startIndex, endIndex);
	};

	useEffect(() => {
		ky.get('/api/v1/sensors/kontich-temperature', {
			searchParams: {
				field: 'temperature',
			},
		})
			.json()
			.then((values) => setData(values as any[]));
	}, []);

	return (
		<div style={{ width: '100%' }}>
			<h4>A demo of synchronized AreaCharts</h4>

			<ResponsiveContainer width="100%" height={500}>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="_time" tickFormatter={(value) => moment(value).format('YYYY-MM-DD HH:mm')} />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="_value" stroke="#82ca9d" fill="#82ca9d" />
				</LineChart>
			</ResponsiveContainer>
			<Brush onChange={fetchData as any} data={data} dataKey="_time" />
		</div>
	);
};

export default App;
