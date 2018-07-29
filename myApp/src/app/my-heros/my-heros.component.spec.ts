import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHerosComponent } from './my-heros.component';

describe('MyHerosComponent', () => {
  let component: MyHerosComponent;
  let fixture: ComponentFixture<MyHerosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyHerosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
