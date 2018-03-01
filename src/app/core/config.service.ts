import { Injectable } from '@angular/core';

/*
 * Configuration service.
 *
 * Put your custom configuration here.
 */
@Injectable()
export class ConfigService {

    // Change these values...
    private _backendUrl = 'http://172.21.32.5:4000/api/';
    get backendUrl(): string {
	return this._backendUrl;
    }

    private _schoolName = 'IES Gilabert de Centelles';
    get schoolName(): string {
	return this._schoolName;
    }
}
