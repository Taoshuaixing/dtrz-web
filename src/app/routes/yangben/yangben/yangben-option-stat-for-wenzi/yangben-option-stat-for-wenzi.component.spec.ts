import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YangbenOptionStatForWenziComponent } from './yangben-option-stat-for-wenzi.component';

describe('YangbenOptionStatForWenziComponent', () => {
  let component: YangbenOptionStatForWenziComponent;
  let fixture: ComponentFixture<YangbenOptionStatForWenziComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YangbenOptionStatForWenziComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YangbenOptionStatForWenziComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
