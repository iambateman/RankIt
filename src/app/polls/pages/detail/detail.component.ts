import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


import { Poll } from '../../../shared/models/poll.interface';
import { PollService } from '../../../shared/services/poll.service';
import { Store } from 'store';

@Component({
  selector: 'app-detail',
  styleUrls: ['./detail.component.scss'],
  template: ` 

    <div class="detail" *ngIf="poll$ | async as poll">
      <header class="poll-header">
        <h1 class="">{{ poll.title }}</h1>
        <p>
          <span *ngFor="let choice of poll.choices; let i = index">
            {{ (i + 1) < poll.choices.length ? choice.label + ', ' : choice.label }}
            
          </span>
        </p>  
      </header>
      <main class="mb-3">
        <div class="card promo-votes mt-2 mb-2">
          <div class="label"><p>Voters</p></div>
          <div class="count"><h1>{{poll.vote_count}}</h1></div>
        </div>

        <mat-card class="mb-2">
          <mat-slide-toggle [checked]="poll.is_open" (click)="toggleOpen(poll)">
            {{poll.is_open ? 'Open, Accepting Votes' : 'Closed, Not Accepting Votes'}}
          </mat-slide-toggle>

          <p *ngIf="poll.keep_open && poll.is_open" class="explainer mt-1">Poll will stay open until you close it.</p>
          <p *ngIf="!poll.keep_open && poll.is_open" class="explainer mt-1">Poll will stay open until {{poll.length.end_time | date : 'long'}}</p>
        </mat-card>

        <button 
          [routerLink]="['/results', poll.id, 'summary']" 
          mat-raised-button color="primary" class="d-block mb-2 has-icon dark-icon button-large"><i class="fa fa-signal"></i>View Results</button>
        <button [routerLink]="['/vote', poll.id]"
          [disabled]="!poll.is_open"
        mat-raised-button color="primary" class="d-block mb-2 has-icon dark-icon button-large"><i class="fa fa-pencil"></i>Vote on this Poll</button>
      </main>

      <hr class="mb-3" />

      <main class="pb-3">
        <h1 class="mb-1">Promote Poll</h1>

        <div class="flex-grid mb-1">
          <button mat-stroked-button color="primary" class="has-icon"><i class="fa fa-link"></i>Copy Voting Link</button>
          <a mat-stroked-button color="primary" class="has-icon"><i class="fa fa-twitter"></i>Tweet</a>
          <a mat-stroked-button color="primary" class="has-icon"><i class="fa fa-facebook-f"></i>Post</a>
        </div>
        <button mat-stroked-button color="primary" class="has-icon d-block mb-5"><i class="fa fa-code"></i>Copy Embed Code</button>

        <hr class="mt-3 mb-4" />
        <button (click)="toggleDelete()" mat-stroked-button color="red" class="has-icon"><i class="fa fa-times"></i>Delete Poll</button>
        <div class="confirmDelete" *ngIf="showDelete">
          Are you sure? <button mat-raised-button color="warn" (click)="deletePoll(poll)">Delete</button> <button mat-button (click)="toggleDelete()">Cancel</button>
        </div>
      </main>
    </div>

    

  `
})
export class DetailComponent implements OnInit {

  poll$: Observable<any>; // should be poll
  subscription: Subscription;

  showDelete:boolean = false;

  constructor(
              private pollService: PollService,
              private router:Router,
              private store:Store,
              private route:ActivatedRoute) {}


  ngOnInit() {
    this.store.set('backButton', 'polls');
    this.subscription = this.pollService.polls$.subscribe();
    
    this.poll$ = this.route.params
    .pipe(
          switchMap(param => {
            console.log(param);
            let poll = this.pollService.getPoll(param.id);
            return poll;
          })
          );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async deletePoll(poll:Poll) {
    await this.pollService.deletePoll(poll);

    this.router.navigate(['/polls']);
  }

  toggleOpen(poll:Poll) {
    this.pollService.togglePollOpen(poll.id, poll.is_open);
  }

  toggleDelete() {
    this.showDelete = !this.showDelete;
  }

}