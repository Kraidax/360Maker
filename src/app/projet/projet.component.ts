import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthCookie } from '../auth-cookies-handler';

export interface projet {
  nom: string;
  nom_classe: string;
  id_classe: string;
  id_projet: string;
}

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.css']
})
export class ProjetComponent {
  public gridApi!: GridApi;
  public rowData$!: projet [];
  public gridColumnApi: any;
  classe : any;
  selected: string = "";
  nom: string = "";
  data: any;

  public columnDefs: ColDef[] = [
    { field: 'nom', headerName: 'Projet'},
    { field: 'nom_classe', headerName: 'Classe'}
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  cookie:any;
  token2: any;

  constructor(private http: HttpClient, private router: Router, private _authCookie: AuthCookie) { }

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
    console.log("this.classe[0].nom:",this.classe[0].nom)
    this.http.get<any[]>('http://localhost:4200/api/getprojets', { headers : {"token" : this.cookie}})
      .subscribe((result)=>{
        this.data = result
        var myArray = new Array<projet>;
        for (let i = 0; i < result.length; i++){
          let tmp : projet;
          tmp = {"nom":result[i].nom, "id_projet": result[i].id_projet, "id_classe":result[i].id_classe, "nom_classe":this.classe.find((e: { id_classe: any; }) => e.id_classe == result[i].id_classe).nom  }
  
          myArray.push(tmp)
        }
        delay(300)
        this.rowData$ = myArray  
      })
  }

  onSubmit(form: NgForm){ 
    var api = this.gridApi!;

    const headers = { 'Content-Type': 'application/json' }
    const nom = form.value['nom']
    const id_classe = this.selected.toString()

    var newItem = [{nom: form.value['nom'], nom_classe:this.classe.find((e: { id_classe: any; }) => e.id_classe == this.selected).nom}]
    api.applyTransaction({ add: newItem });
    this.http.put('http://localhost:4200/api/newprojet', { "nom": nom, "id_classe": id_classe}, { headers : {"token" : this.cookie}})
    .subscribe((result)=>{
      console.warn("result" ,result) 
      })
  }

  onDelete() {

    const selectedData = this.gridApi.getSelectedRows();
    console.log("selectedData :",selectedData)
    const res = this.gridApi.applyTransaction({ remove: selectedData })!;
    const id = selectedData[0].id_projet;
    console.log("id :", id)
    const headers = { 'Content-Type': 'application/json'}
     this.http
       .delete(`http://localhost:4200/api/delprojet/${id}`, { headers : {"token" : this.cookie}})
       .subscribe(
         () => {
           console.log('Fichier supprimé');
         },
         (error) => {
           console.log('Erreur ! : ' + error);
         }
       );
  }

  onAccess(){
    const selectedData = this.gridApi.getSelectedRows();
    const id = selectedData[0].id_projet;
    console.log("id :", id)
    this.router.navigateByUrl('projet/' + id);
  }

  getClasses(){
    this.http.get<any>('http://localhost:4200/api/getclasses', { headers : {"token" : this.cookie}})
    .subscribe(
      (data) => {
      this.classe = data;
    },
      (error) => {
      console.log('Erreur ! : ' + error);
    })
  }


}

function delay(milliseconds : number) {
  return new Promise(resolve => setTimeout( resolve, milliseconds));
}