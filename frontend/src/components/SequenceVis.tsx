import React, {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas';
import Utils from '../modules/Utils.js';
import * as d3 from 'd3';
import * as constants from "../modules/Constants.js";
import {Sequence,Margin} from '../types'

interface rectObject {
    'name': string,
    'pid': number,
    'color': string,
    'startDate': number,
    'endDate': number,
    'x': number,
    'width': number,
    'y': number,
    'height': number,
    'data': object,
}

export default function SequenceVis(props: any){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const margin: Margin = {x: [10,10],y: [10,10]}

    const eventRows = ['surgery','chemotherapy','radiation','other'];
    const minWidth: number = 15;
    function getEventColor(name: string): string {
        let i: number = constants.EventTypes.indexOf(name);
        if(i < 0){
            return 'black';
        }
        return constants.EventColors[i];
    }
    useEffect(()=>{
        if(props.data === undefined || svg === undefined){ return }
        const events: Sequence[] = [...props.data].sort((a,b) => a.start - a.stop);
        const maxTime = d3.max(events.map(d=>d.stop));
        // const maxTime = d3.max(events.filter(d=>d.event !== 'Status').map(d=>d.stop));
        const endMarkWidth = 20;
        const rowEnd = width-margin.x[1]-endMarkWidth;
        const xScale = d3.scaleLinear()
            .domain([0, maxTime])
            .range([margin.x[0],rowEnd - minWidth]);

        const barHeight: number = (height - margin.y[0] - margin.y[1])/(eventRows.length);
        const yScale = d3.scaleLinear()
            .domain([0,3])
            .range([height-margin.y[1]-barHeight,margin.y[0]]);

        function getY(d: Sequence): number {
            let event  = d.event;
            if(event === 'Status'){
                return yScale(3);
            }
            else if(eventRows.indexOf(event) < 0){
                event = 'other'
            }
            let ePos = eventRows.indexOf(event)
            return yScale(ePos);
        }
        const rectData: rectObject[] = events.map(e => {
            // const xPos = e.event === 'Status'? rowEnd : xScale(e.start);
            // const xEnd = e.event === 'Status'? xPos + endMarkWidth: xScale(e.stop);
            const xPos = xScale(e.start);
            const xEnd = xScale(e.stop);
            const width = Math.max(xEnd-xPos, 10);
            let item: rectObject = {
                'name': e.event,
                'color': getEventColor(e.event),
                'pid': e.pid,
                'startDate': e.start,
                'endDate': e.stop,
                'x': xPos,
                'width':  width, 
                'y': getY(e),
                'height': e.event === 'Status'? height - margin.y[0] - margin.y[1]: barHeight,
                'data': e.data,
            }
            return item
        })

        svg.selectAll('.rects').remove();
        const strokeWidth: number = 2;
        const rects = svg.selectAll('.rects').data(rectData)
            .enter().append('rect').attr('class','rects')
            .attr('fill', (d: rectObject) => d.color)
            .attr('stroke','white').attr('stroke-width', strokeWidth)
            .attr('x',(d: rectObject) => d.x)
            .attr('width',(d: rectObject) => d.width)
            .attr('opacity',.6)
            .attr('y', (d: rectObject) => d.y)
            .attr('height', (d: rectObject) => d.height)
            .on('mouseover',(e,d)=>{
                let string: string = '';
                for(let [k,v] of Object.entries(d)){
                    if(k === 'data' || k === 'startPos' || k === 'endPos' || k === 'color'){
                        continue;
                    }
                    string += k;
                    string += ': ' + v + '</br>';
                }
                string += '</br>Data:</br>';
                for(let [k,v] of Object.entries(d.data)){
                    string += k;
                    string += ': ' + v + '</br>';
                }
                tTip.html(string);
                console.log('ttip',tTip,string)
            }).on('mousemove', function(e){
                Utils.moveTTipEvent(tTip,e);
            }).on('mouseout', function(e){
                Utils.hideTTip(tTip);
            });

    },[svg,props.data]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'95%','width':'95%'}}
            ref={d3Container}
        ></div>
    );
}