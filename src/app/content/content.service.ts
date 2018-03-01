import { Injectable } 	from '@angular/core';
import { HttpHeaders,
         HttpParams }	from '@angular/common/http';
import { Observable } 	from 'rxjs/Observable';
//import { Observer } 	from 'rxjs/Observer';

//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/do';

import { BackendService } 		from '../core/backend.service';
import { Group } 			from '../data-model';
import { User } 			from '../data-model';
import { Schedule } 			from '../data-model';
import { Grouping } 			from '../data-model';

@Injectable()
export class ContentService {

    constructor(private backendService: BackendService) {};

    /*
     * getSchedules
     *
     * Returns schedules owned by current user.
     */
    getSchedules(): Observable<Schedule[]> {
        let  call = 'schedules';

        return this.backendService.get(call);
    }

    /*
     * updateSchedule
     *
     * Update schedule for current user.
     */
    updateSchedule(schedule: Schedule): Observable<any> {
        // Remove convenience 'grouping_name' field...
        delete schedule.grouping_name;

        let call = 'schedules';
        let body = JSON.stringify(schedule);
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };

        return this.backendService.put(call, body, options);
    }

    /*
     * deleteSchedule
     *
     * Delete schedule.
     */
    deleteSchedule(schedule: Schedule): Observable<any> {
        let call = 'schedules/' + schedule._id;

        return this.backendService.delete(call);
    }

    /*
     * getGroupings
     *
     * Returns groupings owned by current user.
     */
    getGroupings(excludeMembers: boolean = false): Observable<Grouping[]> {
        let  call = 'groupings';

        let options = excludeMembers ? {params: new HttpParams().set('excludeMembers', 'yes')} : {};

        return this.backendService.get(call, options);
    }

    /*
     * updateGrouping
     *
     * Update grouping for current user.
     */
    updateGrouping(grouping: Grouping): Observable<any> {
        let call = 'groupings';
        let body = JSON.stringify(grouping);
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };

        return this.backendService.put(call, body, options);
    }

    /*
     * deleteGrouping
     *
     * Delete grouping.
     */
    deleteGrouping(grouping: Grouping): Observable<any> {
        let call = 'groupings/' + grouping._id;

        return this.backendService.delete(call);
    }

    /*
     * getGroups
     *
     * Returns groups of users present i LDAP sever.
     */
    getGroups(): Observable<Group[]> {
        let  call = 'groups';

        return this.backendService.get(call);
    }
    
    /*
     * getMembers
     *
     * Returns members of group identified by 'cn' present i LDAP sever.
     */
    getMembers(cn: string): Observable<User[]> {
        let  call = 'groups/' + cn;

        return this.backendService.get(call);
    }
}

