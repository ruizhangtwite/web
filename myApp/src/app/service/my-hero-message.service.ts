import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyHeroMessageService {
  messages: string[]=[];

  constructor() { }
  
  addMessage(message:string):void{
	  this.messages.push(message);
  }
  
  clear(){
	  this.messages=[];
  }
  
}
