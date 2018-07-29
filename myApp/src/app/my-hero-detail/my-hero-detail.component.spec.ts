import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHeroDetailComponent } from './my-hero-detail.component';

describe('MyHeroDetailComponent', () => {
  let component: MyHeroDetailComponent;
  let fixture: ComponentFixture<MyHeroDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyHeroDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHeroDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
