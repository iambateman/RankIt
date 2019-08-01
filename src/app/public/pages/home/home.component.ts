import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

import { Poll } from '../../../shared/models/poll.interface';
import { PollService } from '../../../shared/services/poll.service';
import { Store } from 'store';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  template: `
    
    <main>
    <button
      *ngIf="user$ | async"
      [routerLink]="['/polls']"
      mat-button mat-raised-button [color]="'accent'" 
      class="d-block has-icon dark-icon button-large mb-3">View My Polls <i class="fa fa-chevron-right"></i></button>
      <button
      *ngIf="!(user$ | async)"
      [routerLink]="['/auth/login']"
      mat-button mat-raised-button [color]="'accent'" 
      class="d-block has-icon dark-icon button-large mb-3"><i class="fa fa-user-plus"></i>Sign Up to Create a Poll</button>

   <h1 class="mb-2 mt-2">Public Polls</h1>
      <hr class="mb-2" />
    <div *ngIf="polls$ | async as polls; else loading;">

        <mat-card *ngFor="let poll of polls" [routerLink]="['vote', poll.id]" class="mb-1 linked-card">
        <mat-card-title>{{poll.title}}</mat-card-title>
        <mat-card-subtitle>{{poll.is_open ? 'Open' : 'Closed' }} – {{poll.vote_count ? poll.vote_count + ' votes' : 'No Votes'}}</mat-card-subtitle>
     
        <mat-card *ngIf="polls.length > 10">
          <mat-card-title>No polls yet! How about making one?</mat-card-title>
        </mat-card>
      </mat-card>
        
    </div>

    <ng-template #loading>
      <div class="message">
        <img src="/assets/images/loading.svg" alt="" />
        Fetching polls...
      </div>
    </ng-template>

    </main>

  `
})
export class HomeComponent implements OnInit {
  polls$: Observable<Poll[]>;
  user$: Observable<any>;
  subscription: Subscription;
  constructor(
              private store: Store, 
              private db: AngularFirestore, 
              private pollService:PollService) {
    // this.polls = db.collection('items').valueChanges();
  }

  ngOnInit() {
    this.store.set('backButton', '');
    this.polls$ = this.store.select<Poll[]>('publicPolls');
    this.user$ = this.store.select<any>('user');
    this.subscription = this.pollService.getPublicPolls().subscribe(); // returns subscription
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}