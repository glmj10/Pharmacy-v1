import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../core/models/contact.model';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ContactDetailsComponent],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent {
  contacts: Contact[] = [
    { id: 1, name: 'Amelia Harper', company: 'ACME', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(213)555-4276', email: 'amelia@acme.com', position: 'Manager', address: '123 Business St.' },
    { id: 2, name: 'Anthony Remman', company: 'Clicker', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(310)555-6625', email: 'anthony@clicker.com', position: 'Developer', address: '456 Tech Ave.' },
    { id: 3, name: 'Arnie Schwartz', company: 'Screen Shop', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(714)555-8882', email: 'arnie@screenShop.com', position: 'Designer', address: '789 Creative Blvd.' },
    { id: 4, name: 'Arthur Miller', company: 'Super Mart of the West', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(310)555-8583', email: 'arthur@supermart.com', position: 'CTO', address: '3800 Homer St.' },
    { id: 5, name: 'Barb Banks', company: 'StenoTrack', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(310)555-3355', email: 'barb@stenotrack.com', position: 'Project Manager', address: '321 Finance St.' },
    { id: 6, name: 'Bart Arnaz', company: 'ElectricMax', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(714)555-2000', email: 'bart@electricmax.com', position: 'Director of Engineering', address: '654 Electric Ave.' },
    { id: 7, name: 'Billy Zimmer', company: 'Bresheen', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(909)555-6699', email: 'billy@bresheen.com', position: 'Operations Manager', address: '987 Operations Way' },
    { id: 8, name: 'Brad Farkus', company: 'Walters', status: 'Terminated', assignedTo: 'John Heart', phone: '+1(213)555-3626', email: 'brad@walters.com', position: 'Engineer', address: 'West Ave 22' },
    { id: 9, name: 'Brad Jameson', company: 'Electronics Dep.', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(818)555-4646', email: 'brad.j@electronicsdep.com', position: 'Senior Engineer', address: '147 Electronic St.' },
    { id: 10, name: 'Brett Wade', company: 'Tennis Club', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(626)555-0358', email: 'brett@tennisclub.com', position: 'Coach', address: '258 Sports Complex' },
    { id: 11, name: 'Cindy Stanwick', company: 'Premier Buy', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(818)555-6655', email: 'cindy@premierbuy.com', position: 'HR Assistant', address: '369 Premier Ave.' },
    { id: 12, name: 'Clark Morgan', company: 'Electronics Dep.', status: 'Commission', assignedTo: 'John Heart', phone: '+1(925)555-2525', email: 'clark@electronicsdep.com', position: 'Manager', address: 'Sunset Blvd' },
    { id: 13, name: 'Dallas Lou', company: 'Circuit Town', status: 'Terminated', assignedTo: 'John Heart', phone: '+1(213)555-8357', email: 'dallas@circuittown.com', position: 'Property Assistant', address: '741 Circuit Dr.' },
    { id: 14, name: 'Danny Jones', company: 'Video Emporium', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(626)555-0281', email: 'danny@videoemporium.com', position: 'Support Agent', address: '852 Video Lane' },
    { id: 15, name: 'Ed Holmes', company: 'Walters', status: 'Salaried', assignedTo: 'John Heart', phone: '+1(310)555-1288', email: 'ed@walters.com', position: 'Sales Manager', address: '963 Sales St.' },
    { id: 16, name: 'Gabe Jones', company: 'Clicker', status: 'Salaried', assignedTo: 'Samantha Bright', phone: '+1(310)555-5745', email: 'gabe@clicker.com', position: 'Marketing Specialist', address: '174 Marketing Blvd.' }
  ];

  selectedContact: Contact | null = this.contacts[0];
  searchText = '';
  selectAll = false;

  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.contacts.forEach(contact => contact.selected = this.selectAll);
  }

  toggleContactSelection(contact: Contact) {
    contact.selected = !contact.selected;
    this.selectAll = this.contacts.every(c => c.selected);
  }

  get filteredContacts() {
    if (!this.searchText) {
      return this.contacts;
    }
    return this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      contact.company.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}