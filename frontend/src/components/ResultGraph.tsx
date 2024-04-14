import React, {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import Utils from '../modules/Utils.js';
import * as d3 from 'd3';
import * as constants from "../modules/Constants.js";
import {Margin, Patient,LineGraphResult,LineGraphCollection} from '../types';

interface lineplotItem {
    path: string,
    color: string,
    isPrimary: boolean,
    isConf: boolean,
    value: number,
}
interface legendItem {
    x: number,
    y: number,
    textX: number,
    textY: number,
    text: string,
    color: string,
    width: number,
    height: number,
    isPrimary: boolean,
}

const INTERPOLATORS = {
    'D30': d3.interpolateRgbBasis(["#313695",'#ffffbf', "#a50026"]),
    'var2': d3.interpolateLab("#313695", "#a50026"),
    'var3': d3.interpolateLab("#313695", "#a50026"),
}

function getLegendName(val: number, varName: string): string {
    if(varName === 'var2'){
        if(val === 0){return 'No'}
        if(val === 1){ return 'Yes'}
        if(val === .5){ return 'Former'}
    }
    if(varName === 'var3'){
        if(val === 0){ return 'No'}
        if(val === 1){ return 'Yes'}
    }
    if(varName === 'D30'){
        return val.toFixed(0) + 'Gy'
    }
    return val.toFixed(1)
}
export default function ResultGraph(props: any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const margin: Margin = {x: [10,15],y: [15,15]}
    const titleSpacing: number = 0;
    const subtitleSpacing: number = 20;
    const yLabelSpacing = 40;
    
    useEffect(()=>{
        if(svg === undefined || props.data === undefined || props.inputData === undefined){ return }
        var plotResults: LineGraphResult[] = [];
        var plotVals: number[] = [];
        var times: number[] = props.data.results[0].times;
        for(const i in props.data.changedVars){
            if(props.data.changedVars[i] === props.varName || props.data.changedVars[i] === 'none'){
                plotResults.push(props.data.results[i]);
                plotVals.push(props.data.inputs[i][props.varName]);
            }
        }

        const currVal = props.data.baselineInput[props.varName];
        const maxRefVal = props.varName === 'D30'? 100: 1;
        const minRefVal = props.varName === 'D30'? 10: 0;
        const cvScale = d3.scaleLinear()
            .domain([minRefVal,maxRefVal])
            .range([0,1]);

        const colorInterpolator = INTERPOLATORS[props.varName]? INTERPOLATORS[props.varName]:  d3.interpolateRgbBasis(["#313695",'#ffffbf',"#a50026"]);
        const colorScale = (d: number) => colorInterpolator(cvScale(d))


        const legendSpacing = Math.min(width/3, 120);
        const xStart = margin.x[0] + yLabelSpacing;
        const xEnd = width - margin.x[1] - legendSpacing;
        const xScale = d3.scaleLinear()
            .domain(d3.extent(times))
            .range([xStart + 5, xEnd - 5]);

        const yScale = d3.scaleLinear()
            .domain([0,1])
            .range([height-margin.y[1] - subtitleSpacing, margin.y[0] + titleSpacing]);

        let pathFunc = d3.line();

        const results: lineplotItem[] = plotResults.map((d,i) => {
            let pathVals: [number,number][] = d.values.map((vv,ii) => [xScale(times[ii]),yScale(Math.min(Math.max(0,vv),1))]);
            const isPrimary: boolean = currVal == plotVals[i];
            const entry: lineplotItem = {
                'path': pathFunc(pathVals),
                'color': isPrimary? 'black':colorScale(plotVals[i]),
                // 'color': colorScale(plotVals[i]),
                'isPrimary': isPrimary,
                'isConf': false,
                'value': i,
            }
            return entry
        });

        const confBounds: lineplotItem[] = [];
        const confFill: lineplotItem[] = []
        for(const i in props.data.changedVars){
            if(props.data.changedVars[i] === 'none'){
                const upperVals = props.data.results[i].valuesUpper;
                const lowerVals = props.data.results[i].valuesLower;

                const times = props.data.results[i].times
                const upperPath: [number,number][] = upperVals.map((vv,ii) => [xScale(times[ii]),yScale(Math.min(Math.max(0,vv),1))]);
                const lowerPath: [number,number][] = lowerVals.map((vv,ii) => [xScale(times[ii]),yScale(Math.min(Math.max(0,vv),1))]);

                const upperEntry: lineplotItem = {
                    'path': pathFunc(upperPath),
                    'color': 'grey',
                    'isPrimary': false,
                    'isConf': true,
                    'value': -1,
                }
                const lowerEntry: lineplotItem = {
                    'path': pathFunc(lowerPath),
                    'color': 'grey',
                    'isPrimary': false,
                    'isConf': true,
                    'value': -2,
                }

                confBounds.push(upperEntry);
                confBounds.push(lowerEntry);

                var mergedPath: [number,number][] = upperPath.concat([...lowerPath].reverse());
                confFill.push({
                    'path': pathFunc(mergedPath),
                    'color': 'gray',
                    'isPrimary': false,
                    'isConf': true,
                    'value': -3,
                })
            }
        }

        // svg.selectAll('.path').remove();
        var lines = svg.selectAll('path').filter('.path').data(results.concat(confBounds), (d: lineplotItem) => d.value);
        lines.enter()
            .append('path').attr('class',(d: lineplotItem) => d.isPrimary? 'path pathPrimary': d.isConf? 'path conf': 'path altPath')
            .merge(lines).transition(10000)
            .attr('d', (d: lineplotItem) => d.path)
            .attr('fill','none')
            .attr('stroke', (d: lineplotItem) => d.color)
            .attr('stroke-opacity', (d: lineplotItem) => d.isConf? .8:1)
            .attr('stroke-dasharray', (d: lineplotItem) => d.isPrimary? '': '10 2')
            .attr('stroke-width', (d: lineplotItem) => d.isPrimary? 4: d.isConf? 2:4);
        lines.exit().remove()
        
        // svg.selectAll('.pathFill').remove();
        var confplot = svg.selectAll('path').filter('.pathFill').data(confFill, (d: lineplotItem) => d.value);
        confplot.enter()
            .append('path').attr('class','pathFill conf')
            .merge(confplot).transition(10000)
            .attr('d', (d: lineplotItem) => d.path)
            .attr('fill','grey')
            .attr('fill-opacity',.5)
            .attr('stroke', 'none');
        confplot.exit().remove();

        svg.selectAll('.altPath').raise();
        svg.selectAll('.pathPrimary').raise();

        const legendX: number = width - margin.x[1] - legendSpacing + 15;
        let legendYCurr: number = yScale(1);
        const lBoxSize: number = Math.min(legendSpacing/2,30, (height - margin.y[1] - margin.y[0] - titleSpacing)/(results.length) - 5);
        const fontSize = Math.min(lBoxSize*.7,18);


        let legendData: legendItem[] = [];

        const fixSize: number = props.varName === 'var2'? 1:0;
        for(let ii in plotVals){
            let value = plotVals[ii];
            let color = results[ii].color;
            const entry: legendItem = {
                'x': legendX,
                'y': legendYCurr,
                'textX': lBoxSize + 5 + legendX,
                'textY': legendYCurr + (lBoxSize/2),
                'color': (parseFloat(ii) === 0)? 'black': color,
                'isPrimary': results[ii].isPrimary,
                'text': (parseFloat(ii) === 0)? 'Curr. (' + getLegendName(value,props.varName) + ')' : getLegendName(value,props.varName),
                'width': lBoxSize,
                'height': lBoxSize,
            }
            legendData.push(entry);
            legendYCurr += 5 + lBoxSize;
        }

        // svg.selectAll('.legend').remove();

        let lRects = svg.selectAll('rect').filter('.legend').data(legendData);
        lRects.enter()
            .append('rect').attr('class','legend')
            .merge(lRects).transition(10000)
            .attr('x', (d: legendItem) => d.x)
            .attr('y', (d: legendItem) => d.y)
            .attr('width', (d: legendItem) => d.width)
            .attr('height', (d: legendItem) => d.height)
            .attr('fill', (d: legendItem) => d.color)
            .attr('stroke', 'white')
            .attr('stroke-width',2);
        lRects.exit().remove();
        
        let lText = svg.selectAll('text').filter('.legend').data(legendData);
        lText.enter()
            .append('text').attr('class','legend')
            .merge(lText).transition(10000)
            .attr('x', (d: legendItem) => d.textX)
            .attr('y', (d: legendItem) => d.textY)
            .attr('dominant-baseline','middle')
            .attr('font-size', Math.min(16,fontSize))
            .attr('text-anchor', 'start')
            .text((d: legendItem) => d.text);
        lText.exit().remove();
    
        svg.selectAll('.tick').remove();
        let lTicks = svg.selectAll('.tick').data(times);
        const tickWidth: number = 3;
        lTicks.enter()
            .append('rect').attr('class','tick')
            .attr('x',(d:number) => xScale(d) - (tickWidth/2))
            .attr('y', height - subtitleSpacing - margin.y[1])
            .attr('width',tickWidth).attr('height',subtitleSpacing*.3)
            .attr('fill','grey').attr('opacity',.5);

        svg.selectAll('.tickText').remove();
        let tickText = svg.selectAll('.tickText').data(times);
        tickText.enter()
            .append('text').attr('class','tickText')
            .attr('x',(d:number) => xScale(d))
            .attr('y', height - (subtitleSpacing/4) - margin.y[1])
            .attr('text-anchor','middle').attr('dominant-baseline','middle')
            .attr('font-size',subtitleSpacing*.7)
            .text((d:number) => d + 'm');

        const yGridData = [.25,.5,.75,1];
        svg.selectAll('.yGrid').remove();
        const yGrid = svg.selectAll('.yGrid').data(yGridData);
        yGrid.enter().append('path')
            .attr('class','yGrid')
            .attr('d', (v: number) => pathFunc([[xStart,yScale(v)],[xEnd,yScale(v)]]))
            .attr('fill','none')
            .attr('stroke','grey').attr('opacity',1);

        svg.selectAll('.yGridText').remove();
        const yGridText = svg.selectAll('.yGridText').data(yGridData);
        yGridText.enter().append('text')
            .attr('class','yGridText')
            .attr('x',margin.x[0] + yLabelSpacing - 5)
            .attr('y', (v: number) => yScale(v))
            .attr('text-anchor','end').attr('dominant-baseline','middle')
            .attr('font-size',yLabelSpacing/3)
            .text((v: number) => (v*100).toFixed(0)+'%')

        if(props.showUncertainty){
            svg.selectAll('.conf').attr('opacity','');
        } else{
            svg.selectAll('.conf').attr('opacity',0);
        }
    },[svg,props.data]);

    useEffect(()=>{
        if(svg === undefined){ return }
        if(props.showUncertainty){
            svg.selectAll('.conf').attr('opacity','');
        } else{
            svg.selectAll('.conf').attr('opacity',0);
        }
    },[svg,props.showUncertainty])

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