import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies';

@Injectable()
export class AuthCookie {
    constructor() { }

    getAuth(): string {
        return Cookie.get('token');
    }

    setAuth(value: string): void {
        //0.0138889//this accept day not minuts
        Cookie.set('token', value, 2);
    }

    deleteAuth(): void {
        Cookie.delete('token');
    }  
}