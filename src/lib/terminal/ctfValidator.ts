import {stages} from './ctfChallenges';
import type {Stage} from './types';
export function validateAnswer(stage:Stage,answer:string):boolean{
 if(stage<1||stage>3)return false;
 return answer.trim().toUpperCase()===stages[stage-1].answer;
}
