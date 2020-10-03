import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileServerComponent } from './file-server.component';

describe('FileServerComponent', () => {
  let component: FileServerComponent;
  let fixture: ComponentFixture<FileServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
