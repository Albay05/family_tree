export type Gender = 'M' | 'F';

export interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  note: string;
  gender: Gender;
  parents: string[];
  children: string[];
  partners: string[];
}

export type ModalType = 'ADD' | 'EDIT' | 'RELATION' | 'SAVE' | 'PREVIEW' | null;