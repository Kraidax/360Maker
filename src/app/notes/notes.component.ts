import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AuthCookie } from '../auth-cookies-handler';

export interface Note {
  nom_note: string;
  nom_noteur: string;
  note: string;
  id_elvnoteur: string;
  id_elvnote: string;
  commentaire: string ;
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  public columnDefs: ColDef[] = [
    { field: 'nom_noteur', headerName: 'élève noteur'},
    { field: 'nom_note', headerName: 'élève noté'},
    { field: 'note', headerName: 'Note'},
    { field: 'commentaire', headerName: 'Commentaire'}
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  cookie: any;
  token2: any;
  Notes: Array<Note> = [];
  
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  public gridApi!: GridApi;
  public rowData!: any[];
  public gridColumnApi: any;

  constructor(private http: HttpClient, private route: ActivatedRoute, private _authCookie: AuthCookie, private router: Router) { }

  ngOnInit (){
    this.cookie = localStorage.getItem("currentUser")
    this.token2 = this._authCookie.getAuth()
    if (!this.cookie || !this.token2) {
      this.router.navigate(["/login"]);
    }
    console.log("this.cookie :",this.cookie)
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.http.get<any[]>('http://localhost:4200/api/getnotes', { headers : {"token" : this.cookie}})
      .subscribe((result)=>{
        
        this.Notes = result
        this.http.get<any[]>('http://localhost:4200/api/geteleves', { headers : {"token" : this.cookie}})
        .subscribe((data)=>{
          for(let i = 0; i<data.length; i++){
            console.log("i :", i)
            for(let j = 0; j<this.Notes.length; j++){
              console.log("j :", j)
              if(this.Notes[j].id_elvnoteur == data[i].id_eleve)
                this.Notes[j].nom_noteur = data[i].prenom
              if(this.Notes[j].id_elvnote == data[i].id_eleve)
                this.Notes[j].nom_note = data[i].prenom
            }
          }
        console.log("Notes :", this.Notes)
        this.rowData = this.Notes
      })
    })
  }
}
