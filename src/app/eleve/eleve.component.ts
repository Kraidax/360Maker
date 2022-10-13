import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { NgForm, FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthCookie } from '../auth-cookies-handler';
import { Router } from '@angular/router';

export interface DialogData {
  nom: string;
  prenom: string;
  classe: string;
  mail: string;
}

export interface eleve {
  nom: string;
  prenom: string;
  nom_classe: string;
  mail: string;
  id_classe: string;
  id_eleve: string;
}

@Component({
  selector: 'app-eleve',
  templateUrl: './eleve.component.html',
  styleUrls: ['./eleve.component.css']
})

export class EleveComponent {
  public gridApi!: GridApi;
  public rowData$!: eleve [];
  public gridColumnApi: any;

  nom: string = "";
  prenom: string = "";
  mail: string = "";
  selected: string = "";
  classe: any;
  data: any;
  length!: number;

 public columnDefs: ColDef[] = [
  { field: 'nom', headerName: 'Nom'},
  { field: 'prenom', headerName: 'Prénom'},
  { field: 'nom_classe', headerName: 'Classe', width : 150},
  { field: 'mail', headerName: 'eMail', width : 400}
 ]

public defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};



@ViewChild(AgGridAngular) agGrid!: AgGridAngular;
cookie: any;
token2: any;

constructor(private http: HttpClient, private _authCookie: AuthCookie, private router: Router) {}

  ngOnInit (){

    this.cookie = localStorage.getItem("currentUser")
    this.token2 = this._authCookie.getAuth()
    if (!this.cookie || !this.token2) {
      this.router.navigate(["/login"]);
    }
    console.log("this.cookie :",this.cookie)
  }

  async onGridReady(params: GridReadyEvent) {
  this.getClasses()
  await delay(300)
  this.gridApi = params.api;
  this.gridColumnApi = params.columnApi;
  
  this.http.get<any[]>('http://localhost:4200/api/geteleves', { headers : {"token" : this.cookie}})
    .subscribe((result)=>{
      this.data = result
      console.log("this.data:",this.data)
      var myArray = new Array<eleve>;
      for (let i = 0; i < result.length; i++){
        console.log("i:",i)
        console.log("result[i]:",result[i])
        console.log("result[i].nom:",result[i].nom)
        let tmp : eleve;
        tmp = {"nom":result[i].nom,"prenom":result[i].prenom,"mail":result[i].mail,"id_classe":result[i].id_classe,"id_eleve":result[i].id_eleve,"nom_classe":this.classe.find((e: { id_classe: any; }) => e.id_classe == result[i].id_classe).nom  }

        myArray.push(tmp)
        console.log("myArray 0:", myArray)
      }
      this.rowData$ = myArray
  })
  
  
}

onSelectionChanged() {
  const selectedRows = this.gridApi.getSelectedRows();
  (document.querySelector('#selectedRows') as any).innerHTML =
      selectedRows.length === 1 ? selectedRows[0].nom : '';
}

clearSelection(): void {
  this.agGrid.api.deselectAll();
}

onDelete() {

  const selectedData = this.gridApi.getSelectedRows();
  console.log("selectedData :",selectedData)
  const res = this.gridApi.applyTransaction({ remove: selectedData })!;
  const id = selectedData[0].id_eleve;

  const headers = { 'Content-Type': 'application/json'}
   this.http
     .delete(`http://localhost:4200/api/deleleve/${id}`, { headers : {"token" : this.cookie}})
     .subscribe(
       () => {
         console.log('Fichier supprimé');
       },
       (error) => {
         console.log('Erreur ! : ' + error);
       }
     );
}

onSubmit(form: NgForm){
  var api = this.gridApi!;

  const headers = { 'Content-Type': 'application/json' }
  const nom = form.value['nom']
  const prenom = form.value['prenom']
  const mail = form.value['mail']
  const id_classe = this.selected.toString()

  console.log("onsubmit")

  this.http.put('http://localhost:4200/api/neweleve', { "nom": nom, "prenom": prenom, "mail": mail, "id_classe":id_classe }, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
  .subscribe((result)=>{
    var newItem = [{nom: form.value['nom'], prenom: form.value['prenom'],mail: form.value['mail'], nom_classe: this.classe.find((e: { id_classe: any; }) => e.id_classe == this.selected).nom}]

    console.log("newItem :",newItem)
    api.applyTransaction({ add: newItem });
    console.log("OK") 
   }
  )


  
}

getClasses(){
  this.http.get<any>('http://localhost:4200/api/getclasses', { headers : {"token" : this.cookie}})
  .subscribe(
    (data) => {
    this.classe = data;
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