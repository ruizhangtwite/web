import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {Hero} from '../bean/Hero';
import {MyHeroServiceService} from '../service/my-hero-service.service';

@Component({
  selector: 'app-my-hero-detail',
  templateUrl: './my-hero-detail.component.html',
  styleUrls: ['./my-hero-detail.component.css']
})
export class MyHeroDetailComponent implements OnInit {
   @Input() selectHero: Hero; 
  //selectHero: Hero;
  constructor(private route: ActivatedRoute,
  private heroService:MyHeroServiceService,
  private location: Location) { }

  ngOnInit() {
	  this.getHero();
  }
  
  getHero(): void {
  const id = this.route.snapshot.paramMap.get('id');
  this.heroService.getHero(id)
    .subscribe(hero => this.selectHero = hero);
}

goBack():void{
	this.location.back();
}

}
