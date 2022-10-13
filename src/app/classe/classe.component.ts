import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { delay, Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AuthCookie } from '../auth-cookies-handler';
import { Router } from '@angular/router';
import { Token } from '@angular/compiler';

@Component({
  selector: 'app-classe',
  templateUrl: './classe.component.html',
  styleUrls: ['./classe.component.css']
})
export class ClasseComponent {
  public gridApi!: GridApi;
  public rowData$!: Observable<any[]> ;
  public gridColumnApi: any;

  public columnDefs: ColDef[] = [
    { field: 'nom', headerName: 'Classe'}
  ];
  
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
  
  
  
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  classe: any;
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

  onGridReady(params: GridReadyEvent) {

    this.getClasses()
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowData$ = this.http.get<any[]>('http://localhost:4200/api/getclasses', { headers : {"token" : this.cookie}});
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

  onSubmit(form: NgForm){ 
    var api = this.gridApi!;

    const nom = form.value['nom']
    var newItem = [{nom: form.value['nom']}]
    api.applyTransaction({ add: newItem });
    this.http.put('http://localhost:4200/api/newclasse', { "nom": nom }, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
    .subscribe((result)=>{
      console.warn("result" ,result) 
      })
  }

  onDelete() {

    const selectedData = this.gridApi.getSelectedRows();
    console.log("selectedData :",selectedData)
    const res = this.gridApi.applyTransaction({ remove: selectedData })!;
    const id = selectedData[0].id_classe;
    console.log("id :", id)
     this.http
       .delete(`http://localhost:4200/api/delclasse/${id}`, { headers : { "token" : this.cookie}})
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