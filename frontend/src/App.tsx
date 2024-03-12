import React, {useState,useEffect,useMemo} from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import { ChakraProvider } from '@chakra-ui/react'
import ResultGraph from './components/ResultGraph';
import OutcomeTable from './components/OutcomeTable';
import {Patient,LineGraphResult,LineGraphCollection} from './types';

function getResults(v1: number, v2: number, v3: number, times: number[]): LineGraphResult{
  const lambda: number = 1;
  const total: number = Math.max(.001,Math.abs(v1 + v2 + v3));
  const ks: number[] = [.1,.5,.9];
  const getVal = (t: number,k: number): number => {
    let p1 = k/lambda;
    let p2 = (t/lambda)**(k-1);
    let p3 = Math.exp(-1*(t/lambda)**k);
    return (p1*p2*p3);
  }
  const values: number[] = times.map(t => {
    const vv1 = getVal(t,ks[0]);
    const vv2 = getVal(t,ks[1]);
    const vv3 = getVal(t,ks[2]);
    const res: number  = Math.random() + (vv1*v1 + vv2*v2 + vv3*v3)/total;
    return res;
  })
  const result: LineGraphResult = {times: times, values: values}
  return result
}
function App() {

  const [data,setData] = useState<Patient>({'D30': 0, 'var2': 0, 'var3': 0});
  const timesToPlot = [12,24,36,48,60];
  const plotVariations: object = {
    'D30': [-20,-10,10,20],
    'var2': [-20,-10,10,20],
    'var3': [-20,-10,10,20],
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
        let tempVals = [...values];
        tempVals[i] = tempVals[i] + vv;
        const result: LineGraphResult = getResults(tempVals[0],tempVals[1],tempVals[2],timesToPlot);
        // console.log('vv',vv,key,result.values)
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
        <div className={'title'}>{varName}</div>
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

  const controlPanelSize: string = '15em';
  return (
    <ChakraProvider>
    <div className="App" style={{'height':'100%','width':'100%','display':'block'}}>
      <div className={'fillSpace'} style={{'display':'flex'}}>
        <div id={'controlPanel'} 
          style={{'height':'90vh','width':'15em','display':'inline-block','margin':'.2em','marginTop':'5vh','marginLeft':'2.5vw'}}
          className={'shadow'}
        >
          <div style={{'height':controlPanelSize,'width':'100%'}}>
            <ControlPanel data={data} setData={setData} style={{'marginTop':'0em','alignItems':'center','justifyContent':'center','display':'flex'}}></ControlPanel>
          </div>
          <div style={{'height':'calc(99% - ' + controlPanelSize + ')','width':'100%'}}>
            <OutcomeTable inputData={data} data={results}/>
          </div>
        </div>
        <div 
          style={{'height':'90vh','width':'calc(95vw - 15em)','display':'inline-block','margin':'.2em','marginTop':'5vh'}}
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
