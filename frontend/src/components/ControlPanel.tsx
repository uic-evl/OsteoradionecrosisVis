import React, {useState, useEffect, useRef,useMemo} from 'react';
import Utils from '../modules/Utils.js';
import * as constants from "../modules/Constants.js";
import { Button, ButtonGroup, Input, Radio, RadioGroup, Stack} from '@chakra-ui/react';
import {Patient} from '../types'


export default function ControlPanel(props: any){

    const container = useRef(null);
    const [tempData,setTempData] = useState<object>({})

    const genderNames = ['Female','Male'];
    const genderValues = [0,1];
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
        props.setHasSubmitted(true);
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
                    key={'inputkey'+key}
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
                key={'input'+key}
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
            return (<Radio value={d+''} key={key+i+'radiooption'}>{rName}</Radio>)
        });
        return (
        <div style={{'justifyContent':'center','textAlign':'center','alignItems':'center','marginTop':'.8em'}}>
        <div 
            className={'toggleButtonLabel'}
            style={{'justifyContent':'center','textAlign':'center','alignItems':'center','width':'100%','marginBottom':'0px'}}
            key={'radio2'+key}
        >
            {props.getDisplayName(key)}
        </div>
        <RadioGroup 
            name={key} 
            key={'radio'+key}
            style={{'display':'inline-flex','height':'2em','maxHeight':'2em!important','width':'100%','justifyContent':'center'}}
            value={displayVal+''} onClick={updateRadio}
            >
            <Stack direction={'row'}>
                {rOptions}
            </Stack>
        </RadioGroup>
        </div>
        )
    }   


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
                {makeInput('var1')}
                {makeRadio('var2',genderValues,genderNames)}
                {makeRadio('var3',dentalValues,dentalNames)}
                <Button key='submit' style={{'marginTop':'2em!important'}} colorScheme='blue' onClick={updateData}>
                    {'Submit'}
                </Button>
                
            </div>
            
        </div>
    );
}