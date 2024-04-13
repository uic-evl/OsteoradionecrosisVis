import React, {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import Utils from '../modules/Utils.js';
import * as d3 from 'd3';
import * as constants from "../modules/Constants.js";
import {Margin, Patient,LineGraphResult,LineGraphCollection} from '../types';

interface TableBlock {
    row: number,
    col: number,
    text: string,
    color: string,
}
export default function OutcomeTable(props: any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const margin: Margin = {x: [10,15],y: [15,15]};
    
    const colorScale = d3.interpolateGreys;
    useEffect(()=>{
        if(svg === undefined || props.data === undefined){ return }
        
        var times: number[] = props.data.results[0].times;
        const values: number[] = props.data.results[0].values;
        var tableData: TableBlock[] = [
            {row: 0, col: 0, text: 'Time','color':'none'},
            {row: 0, col: 1, text: 'ORN Risk','color': 'none'}
        ];

        let currRow: number = 1;
        for(let i in times){
            const t: number = times[i];
            const v: number = (1 - values[i]);//show risk istead of survival
            tableData.push({
                row: currRow,
                col: 0,
                text: t+' Months',
                color: 'none',
            });
            tableData.push({
                row: currRow,
                col: 1,
                text: (100*v).toFixed()+'%',
                color: colorScale(v),
            })
            currRow += 1
        }

        const blockHeight: number = (height - margin.y[0] - margin.y[1])/currRow;
        const blockWidth: number = (width - margin.x[0] - margin.x[1])/2;

        function getY(d: TableBlock): number{
            return margin.y[0] + d.row*blockHeight;
        }
        function getX(d: TableBlock): number{
            return margin.x[0] + d.col*blockWidth;
        }

        svg.selectAll('.blocks').remove();
        const blocks = svg.selectAll('.blocks').data(tableData);
        blocks.enter()
            .append('rect').attr('class','blocks')
            .attr('x', getX)
            .attr('y', getY)
            .attr('width',blockWidth)
            .attr('height',blockHeight)
            .attr('fill',(d: TableBlock) => d.color)
            .attr('fill-opacity',.5)
            .attr('stroke','black').attr('stroke-width',3);

        svg.selectAll('.blockText').remove();
        const blockText= svg.selectAll('.blockText').data(tableData);
        blockText.enter()
            .append('text').attr('class','blockText')
            .attr('x', (d: TableBlock) => getX(d) + blockWidth/2)
            .attr('y', (d: TableBlock) => getY(d) + blockHeight/2)
            .attr('dominant-baseline','middle').attr('text-anchor','middle')
            .text((d: TableBlock) => d.text);
    },[svg,props.data])

    const defaultStyle = {'height':'95%','width':'95%'}
    const style = Object.assign(defaultStyle,props.style || {})

    return (
        <div
            className={"d3-component"}
            style={style}
            ref={d3Container}
        ></div>
    );
}