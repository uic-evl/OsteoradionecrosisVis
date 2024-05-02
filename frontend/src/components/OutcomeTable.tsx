import {useEffect, useRef} from 'react';
import useSVGCanvas from './useSVGCanvas';
import * as d3 from 'd3';
import {Margin} from '../types';

interface TableBlock {
    row: number,
    col: number,
    text: string,
    color: string,
}

interface rectItem{
    width: number,
    fill: string,
    stroke: string | number,
    row: number,
    classNames: string,
}

interface errorLineItem{
    path: [number,number][],
    id: string,
}
export default function OutcomeTable(props: any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const margin: Margin = {x: [10,15],y: [15,15]};
    const barGlyphWidth = Math.min(width/2, 300);
    const barSpacing = 10;
    const colorScale = d3.interpolateGreys;
    const filterCondition = (v: number): boolean => v%12 === 0;

    useEffect(()=>{
        if(svg === undefined || props.data === undefined){ return }

        var times: number[] = props.data.results[0].times.map((d:number) => d)
        const values: number[] = [...props.data.results[0].values];
        const valuesUpper: number[] = [...props.data.results[0].valuesUpper];
        const valuesLower: number[] = [...props.data.results[0].valuesLower];

        var tableData: TableBlock[] = [
            {row: 0, col: 0, text: 'Time','color':'none'},
            {row: 0, col: 1, text: 'ORN Risk','color': 'none'}
        ];
        const textEnd = width - margin.x[0] - margin.x[1] - barGlyphWidth - 2*barSpacing;
        const blockWidth: number = (textEnd)/2;
        function getX(d: number): number{
            return margin.x[0] + d*blockWidth;
        }

        const blockHeight: number = (height - margin.y[0] - margin.y[1])/(times.filter(filterCondition).length+1);
        function getY(d: number): number{
            return margin.y[0] + d*blockHeight;
        }

        var rectData: rectItem[] = [];
        var errorData: errorLineItem[] = [];
        let currRow: number = 1;
        const barStart = textEnd + barSpacing;
        const fillScale = d3.interpolateRgbBasis(['#fed976','#b10026']);
        const widthScale = d3.scaleLinear()
            .domain([0,1]).range([0,barGlyphWidth]);
        for(let i in times){
            const t: number = times[i];
            const v: number = (1 - values[i]);//show risk istead of survival
            if(!filterCondition(t)){continue}
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
            rectData.push({
                row: currRow,
                width: widthScale(v),
                fill: fillScale(v),
                stroke: 'none',
                classNames: 'pctRect',
            });
            rectData.push({
                row: currRow,
                width: widthScale(1),
                fill: 'none',
                stroke: 'black',
                classNames: 'pctOutline',
            });
            errorData.push({
                path: [[barStart + widthScale((1-valuesUpper[i])),getY(currRow) + blockHeight/2],
                [barStart + widthScale((1-valuesLower[i])),getY(currRow) + blockHeight/2]],
                id: currRow + 'error',
            })
            currRow += 1
        }

        
        const blocks = svg.selectAll('.blocks').data(tableData.filter(d => d.col ===0));
        blocks.enter()
            .append('rect').attr('class','blocks')
            .attr('x', (d: TableBlock) => getX(d.col))
            .attr('y', (d: TableBlock) => getY(d.row))
            .attr('width',width - margin.x[0] - margin.x[1])
            .attr('height',blockHeight)
            .merge(blocks)
            .attr('fill','none')
            .attr('stroke','black').attr('stroke-width',1);
        blocks.exit().remove();

        svg.selectAll('.blockText').remove();
        const blockText= svg.selectAll('.blockText').data(tableData);
        blockText.enter()
            .append('text').attr('class','blockText')
            .attr('x', (d: TableBlock) => Math.max(margin.x[0]+50,getX(d.col) + blockWidth/2))
            .attr('y', (d: TableBlock) => getY(d.row) + blockHeight/2)
            .attr('dominant-baseline','middle').attr('text-anchor','middle')
            .text((d: TableBlock) => d.text);

        const rectHeight: number = Math.min(blockHeight*.75, 15);
        const bars = svg.selectAll('.pctRect').data(rectData, (d: rectItem) => d.row + d.classNames);
        bars.enter().append('rect')
            .attr('class',(d: rectItem) => 'pctRect '+d.classNames)
            .merge(bars)
            .attr('y', (d: rectItem) => getY(d.row) + blockHeight/2 - rectHeight/2)
            .attr('x', barStart)
            .attr('rx',rectHeight/2).attr('ry',rectHeight/2)
            .attr('height',rectHeight)
            .transition(10000)
            .attr('width', (d: rectItem) => d.width)
            .attr('fill', (d: rectItem) => d.fill)
            .attr('stroke', (d: rectItem) => d.stroke)
            .attr('stroke-width', 3);
        bars.exit().remove();
        svg.selectAll('.pctRect').raise();

        const lineFunc = d3.line();
        const errorLines = svg.selectAll(".errorLine").data(errorData, (d: errorLineItem) => d.id);
        errorLines.enter()
            .append('path')
            .attr('class',(d: errorLineItem) => 'errorLine')
            .merge(errorLines).transition(10000)
            .attr('d', (d: errorLineItem) => lineFunc(d.path))
            .attr('fill','none')
            .attr('stroke','black').attr('stroke-width',3);
        errorLines.exit().remove();
        errorLines.raise();
    },[svg,props.data]);

    useEffect(()=>{
        if(svg !== undefined){
            svg.selectAll(".errorLine").attr('visibility', props.showUncertainty? 'visible':'hidden');
        }
    },[props.showUncertainty,svg])

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