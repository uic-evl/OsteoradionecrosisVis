import React, {useState, useEffect, useRef,useMemo} from 'react';
import Utils from '../modules/Utils.js';
import * as constants from "../modules/Constants.js";
import { Button, ButtonGroup, Input} from '@chakra-ui/react';
import {Patient} from '../types'


export default function ControlPanel(props: any){

    const container = useRef(null);
    const [tempData,setTempData] = useState<object>({})

    function updateInput(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined){
            let tempData2: object = Object.assign({},tempData);
            tempData2[e.target.name] = Number(value);
            setTempData(tempData2)
            // console.log('event',e.target.name,e.target.value)
        }
    }

    function updateData(){
        let newData: Patient = Object.assign({},props.data);
        let flag : boolean = false;
        for(let [key,value] of Object.entries(tempData)){
            if(value !== newData[key]){
                newData[key] = value;
                flag = true;
            }
        }
        if(flag){
            props.setData(newData);
        }
        setTempData({});
    }
    const buttons = useMemo(()=>{
        const inputs = Object.entries(props.data).map(([key,value]: [string,number]) =>{
            let tempVal: number | undefined = tempData[key];
            let displayVal: number = tempVal === undefined? value: tempVal;
            return (
                <ButtonGroup key={key} style={{'display':'block','marginTop':'1em','width':'100%','maxWidth':'100%'}}>
                    <div 
                        className={'toggleButtonLabel'}
                    >
                        {key}
                    </div>
                    <Input 
                    variant='outline' 
                    size={'lg'} 
                    placeholder={displayVal+""} 
                    style={{'marginLeft':'0px','maxWidth':'6em','maxHeight':'1.75em'}}
                    type='number'
                    name={key}
                    onChange={updateInput}
                    />
                </ButtonGroup>
            )
        })
        return inputs
    },[props.data]);

    const defaultStyle = {'height':'95%','width':'95%'};
    const style = Object.assign(defaultStyle,props.style || {});
    return (
        <div
            style={style}
            ref={container}
        >
            <div style={{'width':'100%','display':'block'}}>
                <div className={'title'}>
                    {"Patient Features"}    
                </div>
                {buttons}
                <Button key='submit' style={{'marginTop':'2em!important'}} colorScheme='blue' onClick={updateData}>
                    {'Submit'}
                </Button>
            </div>
            
        </div>
    );
}