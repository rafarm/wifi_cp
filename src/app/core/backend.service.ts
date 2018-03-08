import { Injectable } 		from '@angular/core';
import { HttpClient,
         HttpErrorResponse }    from '@angular/common/http';
import { Observable } 		from 'rxjs/Observable';
import { MatDialog }            from '@angular/material/dialog';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import { ConfigService }	from './config.service';
import { ConfirmationComponent }       from '../utils/confirmation.component';

@Injectable()
export class BackendService {
    private backendUrl: string;
    private errorDialogShown: boolean = false;
    private retryCount: number = 0;

    constructor(
        public dialog: MatDialog,
	private configService: ConfigService,
	private http: HttpClient
    ) {
	this.backendUrl = configService.backendUrl;
    }

    /* get
     *
     * Backend get call.
     */
    get(call: string, options: any = {}): Observable<any> {
	return this.http.get(this.backendUrl + call, options)
	    .map(this.extractData)
            .retryWhen(errors => this.checkUnauthorized(errors, 3))
            .catch(error => this.handleError(error));
    }

    /* put
     *
     * Backend put call.
     */
    put(call: string, body: string, options: any = {}): Observable<any> {
        return this.http.put(this.backendUrl + call, body, options)
            .map(this.extractData)
            .retryWhen(errors => this.checkUnauthorized(errors, 3))
            .catch(error => this.handleError(error));
    }

    /* delete
     *
     * Backend delete call.
     */
    delete(call: string): Observable<any> {
        return this.http.delete(this.backendUrl + call)
            .map(this.extractData)
            .retryWhen(errors => this.checkUnauthorized(errors, 3))
            .catch(error => this.handleError(error));
    }

    /*
     * extractData
     *
     * Extracts json embedded data in backend's response.
     */
    private extractData(res: any) {
	return res['data'] || { };
    }

    /* checkUnauthorized
     *
     * Checks for unauthorized access
     */
    private checkUnauthorized(errors: Observable<HttpErrorResponse>, maxRetries: number): Observable<any> {
        return errors.concatMap(err => {
            if (err.status == 401 || this.retryCount >= maxRetries) {
                this.retryCount = 0;
                return Observable.throw(err);
            }
            
            this.retryCount++;
            return Observable.of(true);
            //return Observable.throw(err);
        });
    }

    /* handleError
     *
     * General error handling.
     */
    private handleError (error: HttpErrorResponse) {
        let errMsg: string = `${error.status} - ${error.message}`;
        let title: string = 'Error de comunicació';
        let content: string = 'Ha hagut un error de comunicació amb el servidor. Per favor, torneu a intentar-ho més tard.';
        let action: () => void = () => {this.errorDialogShown = false};
    
        if (error.status == 401) {
            // Unauthorized access
            title = 'Accès no autoritzat'
            content = 'La sessió ha caducat.';
            action = () => {window.location.href = 'logout';};
        }
        else {
            if (error.error instanceof ErrorEvent) {
                errMsg = 'Backend error: ' + error.error.message;
            }
        }

        this.showErrorDialog(title, content).subscribe(action);
    
        return Observable.throw(errMsg);
    }

    private showErrorDialog(title: string, content: string): Observable<boolean> {
        if (!this.errorDialogShown) {
            this.errorDialogShown = true;
            let dialogRef = this.dialog.open(ConfirmationComponent, {
                closeOnNavigation: true,
                data: {
                    title: title,
                    content: content,
                    cancel: null,
                    action: 'Accepta'
                },
                disableClose: true
            });
            
            return dialogRef.afterClosed();
        }
    
        return Observable.of(false);
    }
}

