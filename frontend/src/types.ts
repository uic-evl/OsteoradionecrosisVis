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
  meanTime: number,
  meanTimeLower: number | null,
  meanTimeUpper: number | null,
  medianTime: number,
  medianTimeLower: number | null,
  medianTimeUpper: number | null,
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