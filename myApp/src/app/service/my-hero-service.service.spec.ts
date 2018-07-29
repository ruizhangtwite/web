import { TestBed, inject } from '@angular/core/testing';

import { MyHeroServiceService } from './my-hero-service.service';

describe('MyHeroServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyHeroServiceService]
    });
  });

  it('should be created', inject([MyHeroServiceService], (service: MyHeroServiceService) => {
    expect(service).toBeTruthy();
  }));
});
