import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthCookie } from '../auth-cookies-handler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  id_projet : string = this.route.snapshot.params['id_projet'];
  Groupes : Array<Groupe> = [];
  nom : any;
  nom_groupe: any = [];
  cookie: any;
  nom_groupes: any = [];

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(private http: HttpClient, private route: ActivatedRoute, private _authCookie: AuthCookie, private router: Router,public dialog: MatDialog) { }

  public columnDefs: ColDef[] = [
    { field: 'nom', headerName: 'Nom'},
    { field: 'prenom', headerName: 'Prénom'},
    { field: 'this.groupe.nom', headerName: 'Groupe', editable: true, cellEditor: 'agSelectCellEditor', cellEditorPopup: false, cellEditorParams: { values: this.nom_groupes } }
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
    this.http.get<any>('http://localhost:4200/api/getgroupes', { headers : {"token" : this.cookie}})
      .subscribe(
        (data) => {
        this.Groupes = data;
        console.log("this.Groupes :" ,this.Groupes)
        delay(300)
        this.http.get<any>(`http://localhost:4200/api/getprojet/${this.id_projet}`, { headers : {"token" : this.cookie}})
        .subscribe(
        (data) => {
          this.projet = data;
          console.log("id_classe :",this.projet.id_classe);
          delay(300)
          this.rowData$ = this.http.get<any>(`http://localhost:4200/api/elvcls/${this.projet.id_classe}`, { headers : {"token" : this.cookie}})
          for(let i=0; i < this.Groupes.length;i++){
            this.nom_groupes.push(this.Groupes[i].nom)
          }
        }
      )
    })

  }

  onSubmit(form: NgForm){
  const nom:string = form.value['nom']
  console.log("nom :" ,nom)
  console.log("id_projet :" ,this.id_projet)
  this.http.post('http://localhost:4200/api/newgroupe', { "nom": nom, "id_projet":this.id_projet }, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
    .subscribe(()=>{
      console.log("OK") 
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentMail);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.http.post('http://localhost:4200/api/modif_body', {"text":result.message}, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
      .subscribe(()=>{
        console.log("body OK") 
      })
      this.http.post('http://localhost:4200/api/modif_body', {"text":result.sujet}, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
      .subscribe(()=>{
        console.log("body OK") 
      })

    });

    
  }

  onDelete() {

    const selectedData = this.gridApi.getSelectedRows();
    console.log("selectedData :",selectedData)
    const res = this.gridApi.applyTransaction({ remove: selectedData })!;
    const id = selectedData[0].id_groupe;
    console.log("id :", id)
     this.http
       .delete(`http://localhost:4200/api/delgroupe/${id}`, { headers : { "token" : this.cookie}})
       .subscribe(
         () => {
           console.log('Fichier supprimé');
         },
         (error) => {
           console.log('Erreur ! : ' + error);
         }
       );
  }

}

@Component({
  selector: 'dialog-content-mail',
  templateUrl: 'dialog-content-mail.html',
})
export class DialogContentMail {
  constructor(
    public dialogRef: MatDialogRef<DialogContentMail>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

function delay(milliseconds : number) {
  return new Promise(resolve => setTimeout( resolve, milliseconds));
}