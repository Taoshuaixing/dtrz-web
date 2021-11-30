import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YangbenDataStatComponent } from './yangben-data-stat.component';

describe('YangbenDataStatComponent', () => {
  let component: YangbenDataStatComponent;
  let fixture: ComponentFixture<YangbenDataStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YangbenDataStatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YangbenDataStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
