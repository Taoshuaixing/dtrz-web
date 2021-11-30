import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationEventRightComponent } from './configuration-event-right.component';

describe('ConfigurationEventRightComponent', () => {
  let component: ConfigurationEventRightComponent;
  let fixture: ComponentFixture<ConfigurationEventRightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationEventRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationEventRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
