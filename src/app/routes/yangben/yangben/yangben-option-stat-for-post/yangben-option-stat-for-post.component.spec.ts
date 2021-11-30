import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YangbenOptionStatForPostComponent } from './yangben-option-stat-for-post.component';

describe('YangbenOptionStatForPostComponent', () => {
  let component: YangbenOptionStatForPostComponent;
  let fixture: ComponentFixture<YangbenOptionStatForPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YangbenOptionStatForPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YangbenOptionStatForPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
