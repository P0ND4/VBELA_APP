type Account = {
  id: string;
  title: string;
  amount: number;
  method: string;
  previous: number;
  status: string;
  observation?: string;
  creationDate: number;
};

export interface Customer {
  id: string;
  agency: boolean;
  name: string;
  firstCountryCode: number;
  firstPhoneNumber: string;
  address: string;
  complement: string;
  email?: string;
  people: number;
  secondCountryCode?: number;
  secondPhoneNumber?: string;
  identification?: string;
  observation?: string;
  account: Account[];
  total: number;
  credit: boolean;
  creationDate: number;
  modificationDate: number;
}
