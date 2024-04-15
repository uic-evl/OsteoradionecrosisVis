import {useRef,useMemo} from 'react';
import { ButtonGroup, Input} from '@chakra-ui/react';
import PctVis from './PctVis'

export default function TimeToEvent(props: any){

    const container = useRef(null);


    function formatPct(val: number): string{
        if(val > .1){
            return (100*val).toFixed(0);
        } else{
            return '0' + (100*val).toFixed(0);
        }
    }
    const getCI = (v: number[]) => v[0].toFixed(0) + ' (' + v[1].toFixed(0) + '-' + v[2].toFixed(0) + ')';
    const getCIPct = (v: number[]) => formatPct(1-v[0]) + '% (' +  formatPct(1-v[2]) + '-' + formatPct(1-v[1]) + '%)';

    function updateTime(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined){
            props.setSelectedTime(value);
        }
    }

    function makeSelectTimeThing(){
        return (
            <div>
                <ButtonGroup key={'selectTimeInput'} style={{'display':'block','marginTop':'1em','width':'100%','maxWidth':'100%'}}>
                    <div 
                        className={'toggleButtonLabel'}
                    >
                        {'ORN Risk At: '}
                    </div>
                    <Input 
                    variant='outline' 
                    size={'lg'} 
                    placeholder={props.selectedTime} 
                    style={{'margin':'0px','maxWidth':'2.5em','maxHeight':'1.75em','padding':'.2em'}}
                    type='number'
                    name={props.selectedTime}
                    onChange={updateTime}
                    />
                    <div 
                        className={'toggleButtonLabel'}
                        style={{"marginLeft":'0px','marginRight':'-10px'}}
                    >
                        {'Months:'}
                        
                    </div>
                    <div className={'resultText'}>
                        {getCIPct(props.selectedTimeResult)}
                    </div>
                </ButtonGroup>
                <div style={{'width':'100%','height':'1.5em'}}>
                    <PctVis data={props.selectedTimeResult}/>
                </div>
            </div>
        )
    }
    const [survivalTimes,medianSurvivalTimes]: [number[],number[]] = useMemo(()=>{
        if(props.results === undefined){return [[0,0,0],[0,0,0]]}
        const res = props.results.results.filter((d,i) => props.results.changedVars[i] == 'none')[0]
        return [[res.meanTime,res.meanTimeLower,res.meanTimeUpper], [res.medianTime,res.medianTimeLower,res.medianTimeUpper]];
    },[props.results])

    const defaultStyle = {'height':'95%','width':'95%'};
    const style = Object.assign(defaultStyle,props.style || {});
    return (
        <div
            style={style}
            ref={container}
        >
            <div style={{'width':'100%','display':'block'}}>
                <div className={'title'}>
                    {"Risk"}    
                </div>
                <div style={{'display':'flex','flexDirection':'column','alignItems':'center','height':'calc(100% - 2.5em)','width':'100%'}}>
                    <hr style={{'marginBottom':'.5em','marginTop':'1em','width':'100%'}}></hr>
                    {makeSelectTimeThing()}
                    <div style={{"marginTop":'.5em'}}>{'Mean Survival (Months): '}<div className={'resultText'}>{getCI(survivalTimes)}</div></div>
                    <div style={{"marginTop":'.5em'}}>{'Median Survival (Months): '}<div className={'resultText'}>{getCI(medianSurvivalTimes)}</div></div>
                </div>
            </div>
            
        </div>
    );
}