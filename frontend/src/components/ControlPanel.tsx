import React, {useState, useEffect, useRef,useMemo} from 'react';
import Utils from '../modules/Utils.js';
import * as constants from "../modules/Constants.js";
import { Button, ButtonGroup, Input, Radio, RadioGroup, Stack} from '@chakra-ui/react';
import {Patient} from '../types'


export default function ControlPanel(props: any){

    const container = useRef(null);
    const [tempData,setTempData] = useState<object>({})

    const smokingStatusNames = ['No/Former','Current'];
    const smokingStatusValues = [0,1];
    const dentalNames = ['No','Yes'];
    const dentalValues = [0,1];

    function updateInput(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined){
            let tempData2: object = Object.assign({},tempData);
            tempData2[e.target.name] = Number(value);
            setTempData(tempData2)
        }
    }

    function updateRadio(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined && value !== undefined){
            let tempData2: object = Object.assign({},tempData);
            tempData2[e.target.name] = Number(value);
            setTempData(tempData2)
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

    function makeInput(key: string): React.ReactElement{
        const value: number | undefined = props.data[key];
        if(value === undefined){ return <Button>{"no"}</Button>}
        let tempVal: number | undefined = tempData[key];
        let displayVal: number = tempVal === undefined? value: tempVal;
        return (
            <ButtonGroup key={key} style={{'display':'block','marginTop':'1em','width':'100%','maxWidth':'100%'}}>
                <div 
                    className={'toggleButtonLabel'}
                >
                    {props.getDisplayName(key)}
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
    }

    function makeRadio(key: string, options: number[], optionNames: string[] | undefined){
        const value: number | undefined = props.data[key];
        if(value === undefined){ return <Button>{"no"}</Button>}
        let tempVal: number | undefined = tempData[key];
        let displayVal: number = tempVal === undefined? value: tempVal;

        const names: string[] = optionNames !== undefined? optionNames: options.map(d => d+'');
        const rOptions = options.map((d: number, i: number) => {
            const rName: string = names[i];
            return (<Radio value={d+''}>{rName}</Radio>)
        });
        return (
        <RadioGroup 
            name={key} 
            key={'radio'+key}
            style={{'display':'inline-block','marginLeft':'1em','marginTop':'1em'}}
            value={displayVal+''} onClick={updateRadio}
            >
            <div 
                className={'toggleButtonLabel'}
            >
                {props.getDisplayName(key)}
            </div>
            <Stack direction={'row'}>
                {rOptions}
            </Stack>
        </RadioGroup>
        )
    }   

    // const inputButtons = useMemo(()=>{
    //     return (
    //         <>
    //             {makeInput('D30')}
    //             {makeInput('var3')}
    //         </>
    //     )
    // },[props.data]);

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
                {makeInput('D30')}
                {makeRadio('var2',smokingStatusValues,smokingStatusNames)}
                <br key='br0'></br>
                {makeRadio('var3',dentalValues,dentalNames)}
                <br key='br'></br>
                <Button key='submit' style={{'marginTop':'2em!important'}} colorScheme='blue' onClick={updateData}>
                    {'Submit'}
                </Button>
            </div>
            
        </div>
    );
}