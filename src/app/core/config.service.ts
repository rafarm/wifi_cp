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

    /* Minimum period of allowance */
    private _minAllowed = 5;
    get minAllowed(): number {
        return this._minAllowed;
    }

    /* Maximum period of allowance */
    private _maxAllowed = 55;
    get maxAllowed(): number {
        return this._maxAllowed;
    }

    /* Allowance period increments */
    private _allowedStep = 5;
    get allowedStep(): number {
        return this._allowedStep;
    }
}
