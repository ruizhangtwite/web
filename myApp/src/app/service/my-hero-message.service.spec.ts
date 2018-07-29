import { TestBed, inject } from '@angular/core/testing';

import { MyHeroMessageService } from './my-hero-message.service';

describe('MyHeroMessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyHeroMessageService]
    });
  });

  it('should be created', inject([MyHeroMessageService], (service: MyHeroMessageService) => {
    expect(service).toBeTruthy();
  }));
});
