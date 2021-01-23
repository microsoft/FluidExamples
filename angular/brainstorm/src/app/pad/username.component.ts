import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-username',
  template: `
    <div class="userName">
      <span>{{ user.name }}</span>
      <span class="userCount">
        (with {{ userCount - 1}} 
        {{ userCount === 2 ? "person" : "people"}})
      </span>
    </div>  
  `
})
export class UsernameComponent implements OnInit {

  @Input() user: IUser;
  @Input() userCount: number;

  constructor() { }

  ngOnInit() { }

}
