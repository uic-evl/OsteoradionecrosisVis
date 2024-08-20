import {useState,useMemo} from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import { ChakraProvider, Grid, GridItem } from '@chakra-ui/react'
import ResultGraph from './components/ResultGraph';
import OutcomeTable from './components/OutcomeTable';
import TimeToEvent from './components/TimeToEvent';
import {Patient,LineGraphResult,LineGraphCollection} from './types';
import About from './components/About';

import {gamma} from 'mathjs';
import { MathJaxContext } from 'better-react-mathjax';



function getResults(v1: number, v2: number, v3: number, times: number[]): LineGraphResult{
  //based on https://courses.washington.edu/b515/l16.pdf proportional hazzard mdoel kinda
  const coef: number[] = [-0.12,-0.48,-0.31];
  const coefLower: number[] = [-0.15, -1.08,-0.71];
  const coefUpper: number[] = [-0.10, -0.11, -0.10]
  const intercept: number = 13.69;
  const interceptLower: number = 11.77;
  const interceptUpper: number = 15.62;
  const shape: number = Math.exp(-0.21);
  const shapeLower: number = Math.exp(-0.35);
  const shapeUpper: number = Math.exp(-0.08);
  function calcS(coefficients: number[], inter: number, shp: number): [number[],number,number] {
    const denom: number = Math.exp(coefficients[0]*v1 + coefficients[1]*v2 + coefficients[2]*v3 + inter);
    const vals: number[] = times.map(t => {
      const s = Math.exp(-1*(t/denom)**shp);
      return s
    })
    const meanEvent = denom*gamma(1 + (1/shp));
    const medianEvent = denom*Math.log(2)**(1/shp)
    return [vals, meanEvent,medianEvent]
  }
  const [values,meanTime,medianTime]: [number[],number,number] = calcS(coef,intercept,shape);
  const [valuesLower,meanTimeLower,medianTimeLower]: [number[],number,number] = calcS(coefLower,intercept,shapeLower);
  const [valuesUpper,meanTimeUpper,medianTimeUpper]: [number[],number,number] = calcS(coefUpper, intercept, shapeUpper);
  const result: LineGraphResult = {
    times: times, 
    values: values, valuesUpper: valuesUpper, valuesLower: valuesLower, 
    meanTime: meanTime, meanTimeUpper: meanTimeUpper, meanTimeLower: meanTimeLower,
    medianTime: medianTime, medianTimeUpper: medianTimeUpper, medianTimeLower: medianTimeLower,
  }
  return result
}
function App() {

  const [data,setData] = useState<Patient>({'var1': 0, 'var2': 0, 'var3': 0});
  const [showUncertainty, setShowUncertainty] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const selectedTimeResult: number[] = useMemo(()=>{
    const res = getResults(data['var1'],data['var2'],data['var3'], [selectedTime]);
    return [res.values[0],res.valuesLower[0],res.valuesUpper[0]];
  },[data,selectedTime])
  
  const timesToPlot = [0,6,12,18,24,30,36,42,48,54,60];
  const plotVariations: object = {
    'var1': [10.0,20,30,40,50,60,70,80,90,99],
    'var2': [0.0,1.0],
    'var3': [0.0,1.0],
  }

  function getDisplayName(name: string): string{
    if(name === 'var2'){ return 'Gender'}
    if(name === 'var3'){ return 'Dental Extraction'}
    if(name === 'var1'){ return 'D25 Mandible (Gy)'}
    return name;
  }

  const results: LineGraphCollection = useMemo(()=>{
    const mainResult = getResults(data.var1,data.var2,data.var3,timesToPlot);
    let results: LineGraphResult[] = [mainResult];
    let changedVars: string[] = ['none'];
    let inputs: Patient[] = [Object.assign({},data)];

    const keys: string[] = Object.keys(data);
    const values: number[] = Object.values(data);
    for(const i in keys){
      const key = keys[i];
      const variants: number[] | undefined = plotVariations[key];
      if(variants === undefined){ continue; }
      for(let vv of variants){
        if(values[i] == vv){ continue; }
        let tempVals = [...values];
        tempVals[i] = vv;
        const result: LineGraphResult = getResults(tempVals[0],tempVals[1],tempVals[2],timesToPlot);
        results.push(result);
        changedVars.push(key);
        inputs.push({'var1': tempVals[0],'var2': tempVals[1], 'var3': tempVals[2]})
      }
    }
    const resultCollection: LineGraphCollection = {results: results,inputs:inputs,changedVars: changedVars, baselineInput: Object.assign({},data)}

    return resultCollection

  },[data]);

  // const graphStyle: any = {'width':'100%','height':'32%','marginTop':'1%'}
  const graphStyle: any = {'width':'100%','height':'99%','marginTop':'1%','padding':'1em'}
  function makeGraph(varName: string){
    return (
      <div key={varName+'graph'} className={'shadow'} style={graphStyle}>
        <div className={'suptitle'}>{getDisplayName(varName) + ' vs ORN-Free survival'}</div>
        <div style={{'width':'100%','height':'calc(100% - 1.5em)'}} className={'rounded'}>
          <ResultGraph 
            inputData={data}
            varName={varName}
            data={results}
            showUncertainty={showUncertainty}
          />
        </div>
      </div>
    )
  }

  function makeStateToggles(names: string[] | number[] | boolean[],stateAttr: any,setStateAttr: any,displayNames: undefined | string[],secondaryAttr: undefined | any): JSX.Element[]{
    return names.map((n: any,i: number)=>{
        const active = n === stateAttr;
        const onClick = active? ()=>{}: ()=>setStateAttr(n);
        var className = 'toggleButton';
        if(active){
            if(secondaryAttr === undefined){
                className += ' toggleButtonCue'
            } else{
                className += ' toggleButtonActive';
            }
        }
        if(n === secondaryAttr){
            className += ' toggleButtonCue'
        }
        let displayName =  n;
        if(displayNames !== undefined){
            displayName = displayNames[i];
        }
        return <div key={displayName} className={className} onClick={onClick}>{displayName}</div>
    });
}

  function makeGraphToggle(){
    return (
      <>
        {makeStateToggles([true,false],showUncertainty,setShowUncertainty,['show','hide'],undefined)}
      </>
    )
  }


  return (
    <ChakraProvider>
      <MathJaxContext>
      <div className="App" style={{'height':'100%','width':'100%','display':'block'}}>
        <Grid
          templateColumns={'1vw 22em 1fr 1fr 1vw'}
          gap={2}
          templateRows={'2vh 20em 1fr 1vh'}
          h='100%'
          w='100%'
        >
          <GridItem className={'edge'} colSpan={5} rowSpan={1}></GridItem>
          <GridItem className={'edge'} colSpan={1} rowSpan={4}></GridItem>

          <GridItem className={'shadow fillSpace'} rowSpan={1} colSpan={1}>
          <div id={'controlPanel'} 
            style={{'display':'inline-block'}}
          >
            <div style={{'height':'calc(100% - 5em)','width':'100%'}}>
              <ControlPanel 
                data={data} 
                setData={setData} 
                results={results} 
                getDisplayName={getDisplayName} 
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedTimeResult={selectedTimeResult}
                setHasSubmitted={setHasSubmitted}
                style={{'marginTop':'0em','alignItems':'center','justifyContent':'center','display':'flex','width':'100%'}}
              />
            </div>
            <div style={{'height': '2em','width':'100%'}}>
                <About style={{'display':'inline','height': '2em','fontSize':'.75em'}}></About>
              </div>
          </div>
          </GridItem>
          <GridItem className={'shadow fillSpace'} rowSpan={1} colSpan={1}>
              {hasSubmitted? <TimeToEvent
                data={data} 
                setData={setData} 
                results={results} 
                getDisplayName={getDisplayName} 
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedTimeResult={selectedTimeResult}
                style={{'marginTop':'0em','alignItems':'top','justifyContent':'center','display':'flex','width':'100%'}}
              /> : <></>}
          </GridItem>
          <GridItem className={'shadow fillSpace'} rowSpan={1} colSpan={1} style={{'minWidth':'25em'}}>
            {hasSubmitted? <OutcomeTable inputData={data} data={results} showUncertainty={showUncertainty}/> : <></>}
          </GridItem>
          <GridItem className={'shadow fillSpace'} rowSpan={1} colSpan={3}>
            <Grid
              templateColumns={'repeat(3,1fr)'}
              templateRows={'1.1em 1.5em 1fr'}
              className={'fillSpace'}
              gap={2}
            >
              <GridItem colSpan={3} rowSpan={1}>
                <div className={'title'} style={{'display':"inline",'justifyContent':'center'}}>
                  Partial Effects on ORN-Free Survival
                </div>
              </GridItem>
              <GridItem colSpan={3} rowSpan={1}>
                {makeGraphToggle()}
              <div className={'toggleButtonLabel'}>Uncertainty</div>
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                {hasSubmitted? makeGraph('var1'): <></>}
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                {hasSubmitted? makeGraph('var2'): <></>}
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                {hasSubmitted? makeGraph('var3'): <></>}
              </GridItem>
              
            </Grid>
        
          </GridItem>
          <GridItem className={'edge'} colSpan={1} rowSpan={4}></GridItem>
          <GridItem className={'edge'} colSpan={5} rowSpan={1}></GridItem>
        </Grid>
      </div>
      </MathJaxContext>
    
    </ChakraProvider>
  
    
  );

}

export default App;
