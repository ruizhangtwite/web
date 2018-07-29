import { Component, OnInit } from '@angular/core';
import {Hero} from '../bean/Hero';
import {HeroDatas} from '../data/init-data';

import {MyHeroServiceService} from '../service/my-hero-service.service';
import {MyHeroMessageService} from '../service/my-hero-message.service';

@Component({
  selector: 'app-my-heros',
  templateUrl: './my-heros.component.html',
  styleUrls: ['./my-heros.component.css']
})
export class MyHerosComponent implements OnInit {
  name="zhangrui";
  hero:Hero = new Hero(20,'zhangrui');
  heros:Hero[];

  selectHero:Hero = new Hero(20,'zhangrui1');

  constructor(private myHeroServiceService:MyHeroServiceService,private myHeroMessageService:MyHeroMessageService) { }

  ngOnInit() {
	 this.getHeros();
  }

  getHeros(): void{
	  this.myHeroServiceService.getHeros().subscribe(heros => this.heros = heros);
  }

  selectItem(hero:Hero, selected):void{
	  hero.selected = selected;
	  this.selectHero=hero;
	  if (hero.selected){
		  this.myHeroMessageService.addMessage(hero.name + "选择了");
	  }

  }

}
