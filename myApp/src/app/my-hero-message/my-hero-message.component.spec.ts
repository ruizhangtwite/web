import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHeroMessageComponent } from './my-hero-message.component';

describe('MyHeroMessageComponent', () => {
  let component: MyHeroMessageComponent;
  let fixture: ComponentFixture<MyHeroMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyHeroMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHeroMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
