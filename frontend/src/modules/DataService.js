import axios from 'axios';
import * as constants from './Constants';
import * as endpoint from './Endpoint.js';

export default class DataService {

    constructor(){
        const headers = {
            'Content-Type': 'application/json',
          };

        this.api = axios.create({
            baseURL: endpoint.API_URL,
            headers: headers,
        });
    }

    async test(){
        let qstring = '/'
        try{
            let response = await this.api.get(qstring)
            return response.data;
        }
        catch(error){
            console.log('test failed',error)
        }
    }
    
    async getPatientSequences(){
        const response = await fetch('../../../datasequence.json');
        console.log('patient response',response);
        const data = await response.json();
        console.log('patient data',data);
        return data
    }


}