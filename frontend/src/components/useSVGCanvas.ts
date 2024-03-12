import React, { useEffect, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

export default function useSVGCanvas(d3Container: React.MutableRefObject<any>): [any, number, number, any]{
    //takes a ref to a container, makes an svg over it, and returns the svg selection, size ,and a tooltip
    const [windowHeight, windowWidth] = useWindowSize();
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [svg, setSvg] = useState<any>();
    const [tTip, setTTip] = useState<any>();


    useEffect(function makeSvg() {
        if(d3Container.current){
            
            d3.select(d3Container.current).selectAll('svg').remove();

            var h = d3Container.current.clientHeight;
            var w = d3Container.current.clientWidth;

            var canvas: any = d3.select(d3Container.current)
                .append('svg')
                .attr('class','frameEntryD3')
                // .attr('viewbox',[0,0,width,height])
                .attr('width',w)
                .attr('height',h);

            if(d3.select('body').select('.tooltip').empty()){
                d3.select('body').append('div')
                    .attr('class','tooltip')
                    .style('visibility','hidden');
            }
            var tip: any = d3.select('body').select('.tooltip');

            setHeight(h);
            setWidth(w);
            setSvg(canvas);
            setTTip(tip);
        }
    },[d3Container.current,windowWidth, windowHeight]);

    return [svg, height, width, tTip]
}

function useWindowSize() {
    const [size, setSize] = useState<number[]>([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }