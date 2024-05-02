import {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import {Margin} from '../types';


interface rectItem{
    width: number,
    height: number,
    fill: string,
    stroke: string | number,
    x: number,
    y: number,
    classNames: string,
}

export default function PctVis(props:any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const xMargin: number = 10;
    const yMargin: number = 5;

    useEffect(()=>{
        if(props.data === undefined || svg === undefined){ return }
        
        const widthScale = d3.scaleLinear()
            .domain([0,1])
            .range([xMargin, width-2*xMargin]);

        const fillScale = d3.interpolateRgbBasis(['#fed976','#b10026']);
        const rectData: rectItem[] = [
            {
                width: widthScale((1-props.data[0])),
                height: height - 2*yMargin,
                fill: fillScale((1-props.data[0])),
                stroke: 'none',
                x: xMargin,
                y: yMargin,
                classNames: 'raise',
            },
            {
                width: widthScale(1),
                height: height - 2*yMargin,
                fill: 'none',
                stroke: 'grey',
                x: xMargin,
                y: yMargin,
                classNames: 'raise', 
            }
        ];

        const rects = svg.selectAll('.rects').data(rectData);
        rects.enter()
            .append('rect')
            .merge(rects)
            .attr('class', (d: rectItem) => 'rects ' + d.classNames)
            .transition(10000)
            .attr('width', (d: rectItem) => d.width)
            .attr('height', (d: rectItem) => d.height)
            .attr('fill', (d: rectItem) => d.fill)
            .attr('stroke', (d: rectItem) => d.stroke)
            .attr('x', (d: rectItem) => d.x)
            .attr('y', (d: rectItem) => d.y)
            .attr('rx', 10).attr('ry',10)
            .attr('stroke-width',3);
        rects.exit().remove();

        const errorLineData: [number,number][] = [[xMargin + widthScale((1-props.data[1])),height/2],[xMargin + widthScale((1-props.data[2])),height/2]];
        const errorLine = svg.selectAll('.errorLine').data([errorLineData]);
        const linefunc = d3.line()
        errorLine.enter()
            .append('path').attr('class','errorLine')
            .merge(errorLine)
            .transition(10000)
            .attr('d', (d: [number,number][]) => linefunc(d))
            .attr('stroke','black')
            .attr('stroke-width',3)

        svg.selectAll('.raise').raise();
        svg.selectAll('.errorLine').raise();
    },[svg,props]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'95%','width':'95%'}}
            ref={d3Container}
        ></div>
    );
}