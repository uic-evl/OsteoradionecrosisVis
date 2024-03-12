import React, {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import Utils from '../modules/Utils.js';
import * as d3 from 'd3';
import * as constants from "../modules/Constants.js";
import {Sequence,Margin} from '../types'

interface kiviatValue {
    'name': string,
    'value': number,
    'plotValue': number,
    'index': number
}

interface kiviatPlotValue extends kiviatValue {
    'x': number,
    'y': number,
    'theta': number,
    'radius': number,
    'xText': number,
    'yText': number,
}
export default function MdasiVis(props: any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const margin: Margin = {x: [15,15],y: [15,15]}

    const valueMap = props.version === 'clinical'? {
        'N-category': [0,3],
        'T-category': [1,4],
        'age': [0,90],
        'packs_per_year': [0,60],
        'total_dose': [6000,7300]
    }: {};

    const bValMap = props.version === 'treatment'? {
        'concurrent': 1,
        'ic': 1,
        'nd': 1,
        'rt': 1,
        'sxprimary': 1,
    } : props.version === 'clinical'? {
        'alive': true,
    } : {};

    function formatData(input: object): kiviatValue[]{
        let values = [];
        for(let [name, vRange] of Object.entries(valueMap)){
            let eVal = input[name]? input[name]: 0;
            let plotVal = (eVal - vRange[0])/(vRange[1] - vRange[0]);
            values.push({
                'name': name,
                'value': eVal,
                'plotValue': plotVal,
                'index': values.length,
            });
        }

        for(let [name,refVal] of Object.entries(bValMap)){
            let eVal = input[name]? input[name]: -1;
            let plotVal = eVal === refVal? 1: 0;
            values.push({
                'name': name,
                'value': eVal,
                'plotValue': plotVal,
                'index': values.length,
            })
        }
         return values;
    }

    function radToCartesian(r: number,t: number): number[]{
        const x = width/2 + r*Math.cos(t);
        const y = height/2 + r*Math.sin(t);
        return [x,y];
    };
    
    function radianToDegree(t: number): number{
        return t*(180/Math.PI)
    }

    const radiusScale = d3.scaleLinear()
                .domain([0,1])
                .range([5,width/2 - Math.max(margin.y[0],margin.y[1],margin.x[0],margin.x[1])]);
    const rScale = (v: number): number => Math.min(radiusScale.range()[1], Math.max(radiusScale.range()[0],radiusScale(v)));

    useEffect(()=>{
        if(props.data === undefined || svg === undefined){ return }
        const data = formatData(props.data);
        const thetaScale = d3.scaleLinear()
                .domain([0,data.length])
                .range([Math.PI/2,2.5*Math.PI]);

        let plotData: kiviatPlotValue[] = [];
        let outlinePoints: [number,number][] = [];
        let pathPoints: [number,number][] = [];
        data.forEach(d => {
            let theta = thetaScale(d.index);
            let radius = rScale(d.plotValue);
            let [x,y] = radToCartesian(radius,theta);
            let [xOutline,yOutline] = radToCartesian(rScale(1),theta);
            let entry: kiviatPlotValue = Object.assign({
                'x': x,'y': y,'theta': theta,'radius': radius,
                'xText': xOutline, 'yText': yOutline,
            },d);

            pathPoints.push([x,y]);
            outlinePoints.push([xOutline,yOutline])
            plotData.push(entry);
        });

        pathPoints.push(pathPoints[0]);
        outlinePoints.push(outlinePoints[0]);
        interface pathObject {
            path: [number,number][],
            fill: string,
            stroke: string,
            sw: number,
            kind: string,
        }
        const pathData: pathObject[] = [
            {
                'path': pathPoints,
                'fill': props.showTicks?'none':'blue',
                'stroke': 'black',
                'sw':2,
                'kind': 'main'
            },
            {
                'path': outlinePoints,
                'fill':'none',
                'stroke': 'grey',
                'sw': 1,
                'kind': 'outline',
            },
        ];

        var kPath = svg.selectAll('.kiviatPath').data(pathData)
        kPath.enter()
            .append('path').attr('class', (d: pathObject) => 'kiviatPath + kPath'+d.kind )
            .merge(kPath)
            .attr('d',(d: pathObject) => d3.line().curve(d3.curveCardinal.tension(.5))(d.path))
            .attr('stroke',(d: pathObject) => d.stroke).attr('stroke-width',(d: pathObject)=>d.sw)
            .attr('fill-opacity',.2)
            .attr('fill',(d: pathObject) => d.fill);

            
            svg.selectAll('.kLabels').remove();
            svg.selectAll('.kLabels').data(plotData)
                .enter()
                .append('text').attr('class','kLabels')
                .attr('x',(d: kiviatPlotValue)=>d.xText)
                .attr('y',(d: kiviatPlotValue)=>d.yText)
                .attr('font-size',11)
                .attr('text-anchor','middle')
                .attr('dominant-baseline','middle')
                .attr('font-weight',800)
                .attr('stroke','white')
                .attr('stroke-width',.1)
                .text((d: kiviatPlotValue)=> d.name
                    .replace('category','cat')
                    .replace('_per_year','/yr')
                    .replace('gender','male')
                    .replace('total_','')
                );

            // svg.selectAll('.kPathreference').raise();
            svg.on('mouseover',(e,d)=>{
                let string = props.pid;
                for(let entry of plotData){
                    string += '</br>' + entry.name + ': ' + entry.value;
                }
                tTip.html(string);
            }).on('mousemove', function(e){
                Utils.moveTTipEvent(tTip,e);
            }).on('mouseout', function(e){
                Utils.hideTTip(tTip);
            })

    },[svg,props.data]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'95%','width':'95%'}}
            ref={d3Container}
        ></div>
    );
}