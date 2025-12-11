import { Component, signal } from '@angular/core';
import { ContactListComponent } from './features/contacts/contact-list/contact-list.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { HeaderComponent } from './core/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [ContactListComponent, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>
      <div class="app-body">
        <app-sidebar [class.sidebar-hidden]="!isSidebarOpen()"></app-sidebar>
        <div class="app-container">
          <app-contact-list></app-contact-list>
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  standalone: true
})

export class App {
  protected readonly title = signal('angular-demo');
  protected readonly isSidebarOpen = signal(true);
  
  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
}
