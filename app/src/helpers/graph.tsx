/* eslint-disable no-sparse-arrays */
import * as d3 from 'd3';
import moment from 'moment';
import React, { useRef } from 'react';

// // Compute values.
// const X = d3.map(data, x);
// const Y = d3.map(data, y);
// const I = d3.map(data, (_, i) => i);
// const defined = (d: any, i: any) => !isNaN(X[i]) && !isNaN(Y[i]);
// const D = d3.map(data, defined);

// // Compute default domains.
// if (xDomain === undefined) xDomain = d3.extent(X);
// if (yDomain === undefined) yDomain = [0, d3.max(Y)];

export const createChart = (data: any[] = []) => {
	const svgRef = useRef(null);

	const X = d3.map(data, (x: any) => moment(x._time).toDate());
	const Y = d3.map(data, (y: any) => y._value);
	const I = d3.map(data, (_, i) => i);
	const defined = (_: any[], i: any) => !isNaN(X[i] as any) && !isNaN(Y[i]);
	const D = d3.map(data as any, defined);

	const xDomain: [any, any] = d3.extent(X);
	const yDomain = [0, d3.max(Y)];

	const width = window.innerWidth;
	const height = 600;

	const marginTop = 20; // top margin, in pixels
	const marginRight = 30; // right margin, in pixels
	const marginBottom = 30; // bottom margin, in pixels
	const marginLeft = 30;

	const svgWidth = width + marginLeft + marginRight;
	const svgHeight = height + marginTop + marginBottom;

	// Construct scales and axes.
	const xScale = d3.scaleTime(xDomain, [marginLeft, width - marginRight]);
	const yScale = d3.scaleLinear(yDomain, [height - marginBottom, marginTop]);
	const xAxis = d3
		.axisBottom(xScale)
		.ticks(width / 80)
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale).ticks(height / 40, undefined);

	const svgEl = d3.select(svgRef.current);
	svgEl.selectAll('*').remove(); // Clear svg content before adding new elements

	const svg = svgEl
		.on('pointerenter pointermove', pointermoved)
		.on('pointerleave', pointerleft)
		.on('touchstart', (event) => event.preventDefault())
		.append('g')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('-webkit-tap-highlight-color', 'transparent')
		.style('overflow', 'visible');

	const color = d3.scaleSequential(yScale.domain(), (t: number) => d3.interpolateTurbo(t - 0.2));
	svg.append('linearGradient')
		.attr('id', 'gradient')
		.attr('gradientUnits', 'userSpaceOnUse')
		.attr('x1', 0)
		.attr('y1', height - marginBottom)
		.attr('x2', 0)
		.attr('y2', marginTop)
		.selectAll('stop')
		.data(d3.ticks(0, 1, 10))
		.join('stop')
		.attr('offset', (d) => d)
		.attr('stop-color', color.interpolator());

	// Construct a line generator.
	const line = d3
		.line()
		.defined((i) => D[i as any])
		.curve(d3.curveLinear)
		.x((i) => xScale(X[i as any]))
		.y((i) => yScale(Y[i as any]));

	// create xAxis
	svg.append('g')
		.attr('transform', `translate(0,${height - marginBottom})`)
		.call(xAxis);

	svg.append('g')
		.attr('transform', `translate(${marginLeft},0)`)
		.call(yAxis)
		.call((g) => g.select('.domain').remove())
		.call((g) =>
			g
				.selectAll('.tick line')
				.clone()
				.attr('x2', width - marginLeft - marginRight)
				.attr('stroke-opacity', 0.1),
		);
	// .call((g) =>
	// 	g
	// 		.append('text')
	// 		.attr('x', -marginLeft)
	// 		.attr('y', 10)
	// 		.attr('fill', 'currentColor')
	// 		.attr('text-anchor', 'start')
	// 		.text('TEST'),
	// );

	// svg.append('path')
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'currentColor')
	// 	.attr('d', line(I.filter((i) => D[i]) as any));

	svg.append('path')
		.attr('fill', 'none')
		.attr('stroke', 'url(#gradient)')
		.attr('stroke-width', 1.5)
		.attr('stroke-linecap', 'round')
		.attr('stroke-linejoin', 'round')
		.attr('stroke-opacity', 1)
		.attr('d', line(I as any));

	// const serie = svg
	// 	.append('g')
	// 	.selectAll('g')
	// 	.data(d3.group(I, (i) => Y[i]))
	// 	.join('g');

	// serie
	// 	.append('g')
	// 	.attr('font-family', 'sans-serif')
	// 	.attr('font-size', 10)
	// 	.attr('text-anchor', 'middle')
	// 	.attr('stroke-linejoin', 'round')
	// 	.attr('stroke-linecap', 'round')
	// 	.selectAll('text')
	// 	.data(([, I]: any) => I)
	// 	.join('text')
	// 	.attr('dy', '0.35em')
	// 	.attr('x', (i: any) => xScale(X[i]))
	// 	.attr('y', (i: any) => yScale(Y[i]))
	// 	.text((i: any) => Y[i])
	// 	.call((text: any) =>
	// 		text
	// 			.filter((_: any, j: any, I: any) => j === I.length - 1)
	// 			.append('tspan')
	// 			.attr('font-weight', 'bold')
	// 			.text((i: any) => ` ${Y[i]}`),
	// 	)
	// 	.call((text: any) => text.clone(true))
	// 	.attr('fill', 'none')
	// 	.attr('stroke', '#FFF')
	// 	.attr('stroke-width', 6);

	const formatDate = xScale.tickFormat(null as any, '%b %-d, %Y %H:%M');
	const formatValue = yScale.tickFormat(100, undefined);
	const title = (i: number) => `${formatDate(X[i])}\n${formatValue(Y[i])}°C`;

	const tooltip = svg.append('g').style('pointer-events', 'none');

	function pointermoved(event: Event) {
		const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));

		tooltip.style('display', null);
		tooltip.attr('transform', `translate(${xScale(X[i])},${yScale(Y[i])})`);

		const path = tooltip.selectAll('path').data([,]).join('path').attr('fill', 'white').attr('stroke', 'black');

		const text = tooltip
			.selectAll('text')
			.data([,])
			.join('text')
			.call((text: any) => {
				return text
					.selectAll('tspan')
					.data(`${title(i)}`.split(/\n/))
					.attr('width', 300)
					.join('tspan')
					.attr('x', 0)
					.attr('y', (_: any, i: any) => `${i * 1.1}em`)
					.attr('font-weight', (_: any, i: any) => (i ? null : 'bold'))
					.text((d: any) => d);
			});

		const { x, y, width: w, height: h } = (text.node() as any)!.getBBox()!;
		text.attr('transform', `translate(${-w / 2},${15 - y})`);
		path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
	}

	function pointerleft() {
		tooltip.style('display', null);
	}

	return <svg className="o-graph" ref={svgRef} width={svgWidth} height={svgHeight} />;
};
