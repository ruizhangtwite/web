import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Hero} from '../bean/Hero';
import {HeroDatas} from '../data/init-data';

@Injectable({
  providedIn: 'root'
})
export class MyHeroServiceService {

  constructor() {
  }

  getHeros():Observable<Hero[]> {
    return of(HeroDatas);
  }

  getHero(id:string):Observable<Hero> {
    for (let item of HeroDatas)
    {
      if (item.id == parseInt(id)) {
        return of(item);
      }
    }
  }
}
