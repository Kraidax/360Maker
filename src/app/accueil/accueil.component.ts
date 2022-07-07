import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';
import { AuthCookie } from '../auth-cookies-handler';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {

  constructor(private route: ActivatedRoute, private _authCookie: AuthCookie, private router: Router,) { }

  ngOnInit(): void {
    if (!this._authCookie.getAuth()) {
      this.router.navigate(["/login"]);
  }
  }

}
