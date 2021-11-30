import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationEventManagementComponent } from './configuration-event-management.component';

describe('ConfigurationEventManagementComponent', () => {
  let component: ConfigurationEventManagementComponent;
  let fixture: ComponentFixture<ConfigurationEventManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationEventManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationEventManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
