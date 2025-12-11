export interface Contact {
  id?: number;
  name: string;
  company: string;
  status: 'Salaried' | 'Terminated' | 'Commission';
  assignedTo: string;
  phone: string;
  email: string;
  position: string;
  address: string;
  avatar?: string;
  selected?: boolean;
}
