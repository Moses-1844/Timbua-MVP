export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'supplier' | 'contractor' | 'regulator';
    token?: string;
}
