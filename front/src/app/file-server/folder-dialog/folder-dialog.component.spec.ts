import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderDialogComponent } from './folder-dialog.component';

describe('FolderDialogComponent', () => {
  let component: FolderDialogComponent;
  let fixture: ComponentFixture<FolderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
