import { Component, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CloseGuiService } from 'app/core/close-gui/close-gui.service';
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements AfterViewInit {
  isScrolled: boolean = false;
  @ViewChild('terms') terms: any;
  public text: string;
  constructor(
    private dialog: MatDialogRef<TermsComponent>,
    private close: CloseGuiService,
    private cd: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.isScrolled = this.terms.nativeElement.clientHeight === this.terms.nativeElement.scrollHeight;
    // Fixing the change detection for test cases
    this.cd.detectChanges();
  }

  acceptTerms(): void {
    this.dialog.close();
  }

  decline(): void {
    this.close.quitElectron();
  }

  onScroll($event: any) {
    const pos = $event.target.offsetHeight + $event.target.scrollTop;
    const max = $event.target.scrollHeight;
    if (pos === max) {
      this.isScrolled = true;
    }
  }
}
