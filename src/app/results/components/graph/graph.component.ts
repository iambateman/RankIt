import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { Poll, Results, Choice } from '../../../shared/models/poll.interface';
import { ResultsService } from '../../../shared/services/results.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'results-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  objectKeys = Object.keys;
  @Input() results: Results;
  @Input() winner_count: number;
  @Input() round: number;
  @Input() summary: boolean;
  @Input() all_choices: Choice[];
  @Input() total_rounds: number;
  @Input() total_votes: number;
  @Input() display_count:boolean;

  get rounds() { return this.results.rounds; }
  get elected() { return this.results.elected; }
  get winning_percentage() { return 1 / (this.winner_count + 1); }
  get threshold() { return this.results.threshold; }

  constructor(
              private resultsService: ResultsService) { }

  ngOnInit() {
    if (this.summary) {
      this.round = this.results.rounds.length-1;
    }
  }

  get sortedChoices() {
    let round = this.round;

    let sorted = this.all_choices;
   // console.log("choices: ", this.results.rounds);
    // hardcoding to round 1, to avoid resorting after they start going through results.
    let choicesWithVotes = this.results.rounds[1];

    // if we start at round 0, it's weird.
    if(round == 0 ) { round = 1;}
    

    // move items that got zero votes to the bottom
    for(let x of sorted) {
      if(!(x in choicesWithVotes)){
        sorted.push(sorted.splice(sorted.indexOf(x), 1)[0]);
      }
    }
    
    sorted = this.all_choices.sort((a, b) => (choicesWithVotes[a] > choicesWithVotes[b]) ? -1 : 1);

    // console.log('running sort', sorted, this.results.rounds[1], this.all_choices);
    return sorted;

  }

  //
  // * IF It's the last round, we may need to round up
  // So we skip doing the math.
  // However, if it's not the last round, we'll do the math.
  declareWinner(round:number, choice:string) {
    if(round == this.total_rounds || round == 0) {
      return this.results.elected.includes(choice);
    } else {
      //console.log("our percentage: ", this.getPercentage(round, choice), Math.round(this.winning_percentage*100)/100)
      return this.getPercentage(round, choice) >= Math.round(this.winning_percentage*100)/100;
    }
  }

  getExhaustedVoteCount(round:number){
    return this.resultsService.getExhaustedVoteCount(round, this.results, this.total_votes, this.winner_count, this.threshold, this.elected, this.rounds);
  }

  getExhaustedVotePercentage(round:number){
    return this.resultsService.getExhaustedVotePercentage(round, this.results, this.total_votes, this.winner_count, this.threshold, this.elected, this.rounds);
  }

  getPercentage(round: number, choice:Choice) {
    return this.resultsService.getPercentage(round, 
                                             choice, 
                                             this.results, 
                                             this.rounds, 
                                             this.winner_count, 
                                             this.winning_percentage, 
                                             this.threshold,
                                             this.total_votes);
  }
  getThreshold() {
    return (this.winning_percentage*100).toFixed(0)+"%";
  }
  getCount(round: number, choice:Choice) {
    return this.resultsService.getCount(round, 
                                        choice, 
                                        this.results,
                                        this.rounds,
                                        this.winner_count,
                                        this.threshold);
  }

  showChange(round:number, choice:Choice) {
    let previousRound = round - 1;
    let currentPercentage = this.getPercentage(round, choice);
    let previousPercentage = this.getPercentage(previousRound, choice);
    let isWinner = this.declareWinner(round, choice);

    // don't show in first round or if it's a winner
    if(round == 1) {
      return false;
    }

    // if different, calculate percentage difference.
    if(previousPercentage && (currentPercentage != previousPercentage)){

      let delta = currentPercentage - previousPercentage;
      console.log(currentPercentage, previousPercentage, delta);

      // if percentage change is positive...
      if(delta > 0) {

        // and delta would go flying off the screen.
        if ((delta + previousPercentage) > this.winning_percentage) {
          // return this.winning_percentage - previousPercentage;
        }

      }
      return delta;
    }

    // Otherwise return false
    return false;
  }

  // There's a logical issue
  // with winning situations because of the cut off on the graph.
  getDeltaGrowthWidth(round: number, choice:Choice) {
    let previousRound = round - 1;
    let currentPercentage = this.getPercentage(round, choice);
    let previousPercentage = this.getPercentage(previousRound, choice);
    let isWinner = this.declareWinner(round, choice);

    if(round == 1) {
      return false;
    }

    // if different, calculate percentage difference.
    if(previousPercentage && (currentPercentage != previousPercentage)){

      let delta = currentPercentage - previousPercentage;

      // if percentage change is positive...
      // and delta would go flying off the screen.
      if( delta > 0 &&
         (delta + previousPercentage) > this.winning_percentage
         ) {
  
          // reset delta to cap at 1.03
          delta = this.winning_percentage - previousPercentage + .03;
      }

      // Make percentage
      return this.getWidth(delta);
    }

    // Otherwise return false
    return false;
  }


  getWidth(percentage:number) {
    let width = percentage/this.winning_percentage * 100;
    if(width >= 101){
      return 103;
    } else {
      return width;
    }
  }
  

}
