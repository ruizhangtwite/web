import { Component, OnInit } from '@angular/core';

import {MyHeroMessageService} from '../service/my-hero-message.service';

@Component({
  selector: 'app-my-hero-message',
  templateUrl: './my-hero-message.component.html',
  styleUrls: ['./my-hero-message.component.css']
})
export class MyHeroMessageComponent implements OnInit {

  constructor(private myheroMessageService:MyHeroMessageService) { }

  ngOnInit() {
  }

}
