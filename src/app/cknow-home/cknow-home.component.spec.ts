import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CknowHomeComponent } from './cknow-home.component';

describe('CknowHomeComponent', () => {
  let component: CknowHomeComponent;
  let fixture: ComponentFixture<CknowHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CknowHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CknowHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
