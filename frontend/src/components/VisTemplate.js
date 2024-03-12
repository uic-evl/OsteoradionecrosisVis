import React, {useState, useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import Utils from '../modules/Utils.js';
import * as d3 from 'd3';
import * as constants from "../modules/Constants.js";



export default function VisTemplate(props){

    const d3Container = useRef(null);
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const bottomMargin = Math.max(height/4,36);

    useEffect(()=>{
        if(props.data === undefined | svg === udnefined){ return }
        console.log(props)
    },[svg,props]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'95%','width':'95%'}}
            ref={d3Container}
        ></div>
    );
}