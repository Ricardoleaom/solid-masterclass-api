export interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  password: string;
  marketingChannel?: string | null;
}
