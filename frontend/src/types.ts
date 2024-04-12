export interface Sequence {
    pid: number,
    start: number,
    stop: number,
    event: string,
    data: any,
  }
  export interface Patient{
    [key: string]: number
  }

export interface LineGraphResult{
  times: number[],
  values: number[],
  valuesLower: number[],
  valuesUpper: number[],
}

export interface LineGraphCollection{
  results: LineGraphResult[],
  inputs: Patient[],
  changedVars: string[],
  baselineInput: Patient,
}

export interface Margin {
  x: [number, number],
  y: [number, number]
}