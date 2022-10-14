/* eslint-disable no-sparse-arrays */
import * as d3 from 'd3';
import moment from 'moment';
import React, { useRef } from 'react';

export const createBrush = (data: any[] = [], svgRef: any, brushSelectionCallback?: (dates: [Date, Date]) => void) => {
	const X = d3.map(data, (x: any) => moment(x._time).toDate());
	const Y = d3.map(data, (y: any) => y._value);
	const I = d3.map(data, (_, i) => i);
	const defined = (_: any[], i: any) => !isNaN(X[i] as any) && !isNaN(Y[i]);
	const D = d3.map(data as any, defined);

	const xDomain: [any, any] = d3.extent(X);
	const yDomain = [0, d3.max(Y)];

	const width = window.innerWidth;
	const height = 100;
	const focusHeight = 100;
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
		.append('g')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('-webkit-tap-highlight-color', 'transparent')
		.style('overflow', 'visible');

	const brush = d3
		.brushX()
		.extent([
			[marginLeft, 0.5],
			[width - marginRight, focusHeight - marginBottom + 0.5],
		])
		// .on('brushend', brushed)
		.on('end', brushended);

	const defaultSelection = [xScale(d3.utcDay.offset(xScale.domain()[1], -1)), xScale.range()[1]];

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
				.attr('x2', width - marginLeft - marginRight),
		);

	svg.append('path')
		.attr('fill', 'none')
		.attr('stroke', 'white')
		.attr('stroke-width', 1.5)
		.attr('stroke-linecap', 'round')
		.attr('stroke-linejoin', 'round')
		.attr('stroke-opacity', 1)
		.attr('d', line(I as any));

	svg.append('g').call(brush).call(brush.move, defaultSelection);

	function brushended({ selection }: any) {
		if (selection) {
			brushSelectionCallback?.(selection.map(xScale.invert, xScale));
			svg.property('value', selection.map(xScale.invert, xScale));
			svg.dispatch('input');
		}
	}

	return <svg className="o-graph" ref={svgRef} width={svgWidth} height={svgHeight} />;
};
