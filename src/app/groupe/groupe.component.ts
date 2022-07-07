import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthCookie } from '../auth-cookies-handler';

export interface Groupe {
  nom: string;
  id_classe: string;
  id_projet: string;
}

@Component({
  selector: 'app-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.css']
})

export class GroupeComponent {
  public gridApi!: GridApi;
  public rowData$!: Observable<any[]> ;
  public gridColumnApi: any;

  projet: any;
  id : string = this.route.snapshot.params['id_projet'];
  id_projet = Number(this.id);
  Groupes : Array<Groupe> = [];
  nom : any;
  nom_groupe: any = [];
  cookie: any;

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(private http: HttpClient, private route: ActivatedRoute, private _authCookie: AuthCookie, private router: Router) { }

  public columnDefs: ColDef[] = [
    { field: 'nom', headerName: 'Nom'},
    { field: 'prenom', headerName: 'Prénom'},
    { field: 'this.groupe.nom', headerName: 'Groupe', editable: true, cellEditor: 'agSelectCellEditor', cellEditorPopup: false, cellEditorParams: { values: this.nom_groupe } }
  ];
  
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit (){

    this.cookie = this._authCookie.getAuth()
    if (!this.cookie) {
      this.router.navigate(["/login"]);
  }
  }

  onGridReady(params: GridReadyEvent) {

    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getGroupes();
    delay(300)
    console.log("this.Groupes 2 :" ,this.Groupes)
      this.http.get<any>(`http://localhost:4200/api/getprojet/${this.id_projet}`, { headers : {"token" : this.cookie}})
      .subscribe(
        (data) => {
          this.projet = data;
          console.log("id_classe :",this.projet.id_classe);
          this.rowData$ = this.http.get<any>(`http://localhost:4200/api/elvcls/${this.projet.id_classe}`, { headers : {"token" : this.cookie}})
        },
        (error) => {
          console.log('Erreur ! : ' + error);
        }
      )
    

  }

  onSubmit(form: NgForm){
  var api = this.gridApi!;
  const nom = form.value['nom']
  const headers = { 'Content-Type': 'application/json' }
  console.log("nom :" ,nom)
  console.log("id_projet :" ,this.id_projet)
  this.http.post('http://localhost:4200/api/newgroupe', { "nom": nom, "id_projet":this.id_projet }, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
    .subscribe((result)=>{
      console.log("OK") 
    })
  }

  getGroupes(){
      this.http.get<any>('http://localhost:4200/api/getgroupes', { headers : {"token" : this.cookie}})
      .subscribe(
        (data) => {
        this.Groupes = data;
        console.log("this.Groupes :" ,this.Groupes)
      },
        (error) => {
        console.log('Erreur ! : ' + error);
      }
      )
    }

}

function delay(milliseconds : number) {
  return new Promise(resolve => setTimeout( resolve, milliseconds));
}