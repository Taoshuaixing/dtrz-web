import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JournalRoutingModule } from './journal-routing.module';
import { JournalComponent } from './journal/journal.component';
import { SharedModule } from '@shared';
import { JournalReportComponent } from './journal/journal-report/journal-report.component';
import { JournalSubmittedComponent } from './journal/journal-submitted/journal-submitted.component';
import { JournalDraftsComponent } from './journal/journal-drafts/journal-drafts.component';
import { JournalTemplateConfigComponent } from './journal/journal-template-config/journal-template-config.component';
import { JournalTemplateDetailComponent } from './journal/journal-template-config/journal-template-detail/journal-template-detail.component';
import { YangbenModule } from '../yangben/yangben.module';
import { JournalDetailComponent } from './journal/journal-detail/journal-detail.component';
import { NzModalJournalEventComponent } from './journal/nz-modal-journal-event/nz-modal-journal-event.component';
import { JournalViewComponent } from './journal/journal-view/journal-view.component';
import { JournalFinishComponent } from './journal/journal-finish/journal-finish.component';
import { JournalAddComponent } from './journal/journal-add/journal-add.component';
import { JournalShareComponent } from './journal/journal-share/journal-share.component';
import { JournalService } from './journal.service';
import { JournalOptionSettingsComponent } from './journal/journal-detail/journal-option-settings/journal-option-settings.component';

@NgModule({
  declarations: [
    JournalComponent,
    JournalReportComponent,
    JournalSubmittedComponent,
    JournalDraftsComponent,
    JournalTemplateConfigComponent,
    JournalTemplateDetailComponent,
    JournalDetailComponent,
    NzModalJournalEventComponent,
    JournalViewComponent,
    JournalFinishComponent,
    JournalAddComponent,
    JournalShareComponent,
    JournalOptionSettingsComponent,
  ],
  imports: [CommonModule, JournalRoutingModule, SharedModule, YangbenModule],
  providers: [JournalService],
})
export class JournalModule {}
