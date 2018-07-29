import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {MyHerosComponent} from './my-heros/my-heros.component';
import {MyHeroDetailComponent} from './my-hero-detail/my-hero-detail.component';
import {MyHeroMessageComponent} from './my-hero-message/my-hero-message.component';

const routes: Routes = [
	{ path: '', redirectTo:'/main',pathMatch:'full' },
	{ path: 'main', component: MyHerosComponent },
	{ path: 'message', component: MyHeroMessageComponent },
    { path: 'detail/:id', component: MyHeroDetailComponent }
];

@NgModule({
  	
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
	
	
}