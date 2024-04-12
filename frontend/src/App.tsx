import React, {useState,useEffect,useMemo} from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import { ChakraProvider } from '@chakra-ui/react'
import ResultGraph from './components/ResultGraph';
import OutcomeTable from './components/OutcomeTable';
import {Patient,LineGraphResult,LineGraphCollection} from './types';


function getResults(v1: number, v2: number, v3: number, times: number[]): LineGraphResult{
  //based on https://courses.washington.edu/b515/l16.pdf proportional hazzard mdoel kinda
  const coef: number[] = [-0.089023,-.650660,-.698166];
  const coefLower: number[] = [-0.112419, -1.066934,-1.220351];
  const coefUpper: number[] = [-0.065627, -0.234386, -.175981]
  const intercept: number = 11.39;
  const interceptLower: number = 9.946831;
  const interceptUpper: number = 12.825167;
  const shape: number = Math.exp(-0.274481);
  const shapeLower: number = Math.exp(-0.406940);
  const shapeUpper: number = Math.exp(-0.142022);
  function calcS(coefficients: number[], inter: number, shp: number): number[] {
    const vals: number[] = times.map(t => {
      const denom: number = Math.exp(coefficients[0]*v1 + coefficients[1]*v2 + coefficients[2]*v3 + inter);
      const s = Math.exp(-1*(t/denom)**shp);
      return s
    })
    return vals
  }
  const values: number[] = calcS(coef,intercept,shape);
  const valuesLower: number[] = calcS(coefLower,interceptLower,shapeLower);
  const valuesUpper: number[] = calcS(coefUpper, interceptUpper, shapeUpper);
  const result: LineGraphResult = {times: times, values: values, valuesUpper: valuesUpper, valuesLower: valuesLower}
  console.log('results',result)
  return result
}
function App() {

  const [data,setData] = useState<Patient>({'D30': 0, 'var2': 0, 'var3': 0});
  const timesToPlot = [12,24,36,48,60];
  const plotVariations: object = {
    'D30': [10.0,20,30,40,50,60,70,80,90,99],
    'var2': [0.0,1.0],
    'var3': [0.0,1.0],
  }

  function getDisplayName(name: string): string{
    if(name === 'var2'){ return 'Smoking Status'}
    if(name === 'var3'){ return 'Dental Extraction'}
    if(name === 'D30'){ return 'D30 Mandible (GY)'}
    return name;
  }

  const results: LineGraphCollection = useMemo(()=>{
    const mainResult = getResults(data.D30,data.var2,data.var3,timesToPlot);
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
        inputs.push({'D30': tempVals[0],'var2': tempVals[1], 'var3': tempVals[2]})
      }
    }
    const resultCollection: LineGraphCollection = {results: results,inputs:inputs,changedVars: changedVars, baselineInput: Object.assign({},data)}
    // console.log('results',resultCollection.results);
    return resultCollection

  },[data]);

  const graphStyle: any = {'width':'100%','height':'31.5%','marginTop':'1%'}

  function makeGraph(varName: string){
    return (
      <div key={varName+'graph'} className={'shadow'} style={graphStyle}>
        <div className={'title'}>{getDisplayName(varName) + ' vs ORN-Free survival'}</div>
        <div style={{'width':'100%','height':'calc(100% - 1.5em)'}} className={'rounded'}>
          <ResultGraph 
            inputData={data}
            varName={varName}
            data={results}
          />
        </div>
      </div>
    )
  }

  const controlPanelSize: string = '18em';
  return (
    <ChakraProvider>
    <div className="App" style={{'height':'100%','width':'100%','display':'block'}}>
      <div className={'fillSpace'} style={{'display':'flex'}}>
        <div id={'controlPanel'} 
          style={{'height':'90vh','width':'25em','display':'inline-block','margin':'.2em','marginTop':'5vh','marginLeft':'2.5vw'}}
          className={'shadow'}
        >
          <div style={{'height':controlPanelSize,'width':'100%'}}>
            <ControlPanel data={data} setData={setData} getDisplayName={getDisplayName} style={{'marginTop':'0em','alignItems':'center','justifyContent':'center','display':'flex'}}></ControlPanel>
          </div>
          <div style={{'height':'calc(99% - ' + controlPanelSize + ')','width':'100%'}}>
            <OutcomeTable inputData={data} data={results}/>
          </div>
        </div>
        <div 
          style={{'height':'90vh','width':'calc(65vw - 15em)','display':'inline-block','margin':'.2em','marginTop':'5vh'}}
          className={'shadow'}
        >
            {makeGraph('D30')}
            {makeGraph('var2')}
            {makeGraph('var3')}
        </div>
      </div>
    </div>
    </ChakraProvider>
  
    
  );

}

export default App;
