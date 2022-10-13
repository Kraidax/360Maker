import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CellEditingStartedEvent, CellValueChangedEvent, ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';

import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthCookie } from '../auth-cookies-handler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface Groupe {
  id_groupe: string;
  nom: string;
  id_classe: string;
  id_projet: string;
}

export interface Eleve {
  id_classe: string;
  id_eleve: string;
  mail: string;
  nom: string;
  prenom: string;
  nom_groupe: string ;
  id_groupe: string ;
}

@Component({
  selector: 'app-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.component.css']
})

export class GroupeComponent {
  public gridApi!: GridApi;
  public rowData!: any ;
  public gridColumnApi: any;

  projet: any;
  id_projet : string = this.route.snapshot.params['id_projet'];
  Groupes : Array<Groupe> = [];
  nom : any;
  nom_groupe: any = [];
  cookie: any;
  token2: any;
  nom_total: any = "";
  oldCellValue: any;
  liste_eleves: Array<Eleve> = [];
  AllData: any;

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(private http: HttpClient, private route: ActivatedRoute, private _authCookie: AuthCookie, private router: Router,public dialog: MatDialog) { }

  public columnDefs: ColDef[] = [
    { field: 'nom', headerName: 'Nom', editable: false},
    { field: 'prenom', headerName: 'Prénom', editable: false},
    { field: 'nom_groupe', headerName: 'Groupe'}
  ];
  
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
    flex : 1
  };

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
    this.http.get<any>('http://localhost:4200/api/getgroupes', { headers : {"token" : this.cookie}})
      .subscribe(
        (data) => {
        this.Groupes = data;
        delay(300)
        this.http.get<any>(`http://localhost:4200/api/getprojet/${this.id_projet}`, { headers : {"token" : this.cookie}})
        .subscribe(
        (data) => {
          this.projet = data;
          delay(300)
          console.log("this.projet :",this.projet)

          
          this.http.get<any>(`http://localhost:4200/api/elvcls/${this.projet.id_classe}`, { headers : {"token" : this.cookie}})
          .subscribe((data) => {
            this.liste_eleves = data;
            console.log("this.liste_eleves :",this.liste_eleves)
            this.http.get<any>('http://localhost:4200/api/geteleves_groupes', { headers : {"token" : this.cookie}})
              .subscribe(
              (data) => {
                let AllEleveGroupe = data;
                console.log("AllEleveGroupe :",AllEleveGroupe)
                for(let i=0; i < AllEleveGroupe.length;i++){
                  for(let j=0; j < this.Groupes.length;j++){
                    console.log("verif :",AllEleveGroupe[i].id_groupe.toString(), "et",this.Groupes[j].id_groupe.toString() )
                    if(AllEleveGroupe[i].id_groupe.toString() == this.Groupes[j].id_groupe.toString()){
                      console.log("this.liste_eleves :",this.liste_eleves)
                      for(let k=0; k< this.liste_eleves.length;k++){
                        console.log("vérifié")
                        console.log("verif 2 :",this.liste_eleves[k].id_eleve, "et",AllEleveGroupe[i].id_eleve)
                        if(this.liste_eleves[k].id_eleve == AllEleveGroupe[i].id_eleve){
                          console.log("validé, k :", k)
                          this.liste_eleves[k].id_groupe = this.Groupes[j].id_groupe
                          this.liste_eleves[k].nom_groupe = this.Groupes[j].nom
                          console.log("this.liste_eleves modif :",this.liste_eleves)
                        }
                      }
                    }
                  }
                }
                delay(400)
                this.rowData = this.liste_eleves
                console.log("this.liste_eleves 2 :",this.liste_eleves)

              })
            
            
          })
          console.log("groupes :", this.Groupes)
          
          for(let i=0; i < this.Groupes.length;i++){
            this.nom_total = this.nom_total  + this.Groupes[i].nom + ", "
          }
        }
      )
    })
  }

  onCellEditingStarted(event: CellEditingStartedEvent){
    this.oldCellValue = event.value
    console.log("Edit :",this.oldCellValue)
  }

  onCellValueChanged(event: CellValueChangedEvent){
    var data = event.data
    console.log("data :", data)
    console.log("this.oldCellValue :",this.oldCellValue )
    if(this.oldCellValue != null){
      console.log("this.oldCellValue validé:" )
      for(let i=0; i<this.Groupes.length ; i++ ){
        if(this.oldCellValue == this.Groupes[i].nom){
          this.http.get<any>('http://localhost:4200/api/geteleves_groupes', { headers : {"token" : this.cookie}})
          .subscribe(
          (info) => {
            let AllEleveGroupe = info;
            console.log("AllEleveGroupe :", AllEleveGroupe)
            console.log("AllEleveGroupe.length :", AllEleveGroupe.length)
            for(let j=0; j<AllEleveGroupe.length; j++){
              if(this.oldCellValue == AllEleveGroupe[j].id_groupe && data.id_eleve == AllEleveGroupe[j].id_eleve){
                this.http.delete(`http://localhost:4200/api/deleleve_groupe/${AllEleveGroupe[i].id_eg}`, { headers : {"token" : this.cookie}})
                .subscribe(
                () => {
                    console.log('Fichier supprimé');
                })
              }
            }
          })
        }
      }
    }

    
    for(let i=0; i < this.Groupes.length;i++){
      if(data.nom_groupe == this.Groupes[i].nom){
        data.id_groupe = this.Groupes[i].id_groupe
        console.log("data.nom_groupe :", data.nom_groupe)
        console.log("this.Groupes[i] :", this.Groupes[i])
        this.http.put('http://localhost:4200/api/neweleve_groupe', {"id_eleve": String(data.id_eleve), "id_groupe": String(this.Groupes[i].id_groupe)}, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
        .subscribe(()=>{
          console.log("OK") 
        })
        console.log("élève ajouté")
      }
    }
    console.log("Modif :",data)
  }

  onSubmit(form: NgForm){
  const nom:string = form.value['nom']
  this.http.put('http://localhost:4200/api/newgroupe', { "nom": nom, "id_projet":this.id_projet }, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
    .subscribe(()=>{
      console.log("OK") 
    })
  }

  
  openDialog() {
    const dialogRef = this.dialog.open(DialogContentMail);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.http.put('http://localhost:4200/api/modif_sujet', {"text":result}, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
      .subscribe(()=>{
        console.log("sujet OK") 
      })

    });

  }

  openDialogMessage(){
    const dialogRef = this.dialog.open(DialogContentMessage);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.http.put('http://localhost:4200/api/modif_body', {"text":result}, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
      .subscribe(()=>{
        console.log("Message OK") 
      })

    });
  }

  onDelete() {

    const selectedData = this.gridApi.getSelectedRows();
    console.log("selectedData delete:",selectedData)
    const res = this.gridApi.applyTransaction({ remove: selectedData })!;
    const id = selectedData[0].id_groupe;
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

  async onSend() {
    
    this.http.get<any>('http://localhost:4200/api/geteleves_groupes', { headers : {"token" : this.cookie}})
    .subscribe(
    (info) => {
      let AllEleveGroupe = info;
      for(let i=0; i<AllEleveGroupe.length; i++){
        for(let j=0; j<this.Groupes.length; j++){
          if(AllEleveGroupe[i].id_groupe == this.Groupes[j].id_groupe){
            
            this.http.get(`http://localhost:4200/api/mail/${AllEleveGroupe[i].id_eg}`, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
            .subscribe(()=>{
              console.log("Mail envoyé") 
            },
            (error) => {
            console.log('Erreur ! : ' + error);
            });
          }
        }
      }
    })
      
  }

  
  async onRappel() {
    
    this.http.get<any>('http://localhost:4200/api/geteleves_groupes', { headers : {"token" : this.cookie}})
    .subscribe(
    (info) => {
      let AllEleveGroupe = info;
      for(let i=0; i<AllEleveGroupe.length; i++){
        for(let j=0; j<this.Groupes.length; j++){
          delay(300)
          if(AllEleveGroupe[i].id_groupe == this.Groupes[j].id_groupe){
            this.http.get(`http://localhost:4200/api/rappel/${AllEleveGroupe[i].id_eg}`, { headers : {'Content-Type': 'application/json', "token" : this.cookie}})
            .subscribe(()=>{
              console.log("Mail envoyé") 
            },
            (error) => {
            console.log('Erreur ! : ' + error);
            });
          }
        }
      }
    })
      
  }


  onAccess(){
    const selectedData = this.gridApi.getSelectedRows();
    const Access_id_groupe = selectedData[0].id_groupe;
    const Access_id_eleve = selectedData[0].id_eleve;
    this.http.get<any>('http://localhost:4200/api/geteleves_groupes', { headers : {"token" : this.cookie}})
    .subscribe(
    (info) => {
      let AllEleveGroupe = info;
      for(let i=0; i<AllEleveGroupe.length; i++){
        if(Access_id_groupe == AllEleveGroupe[i].id_groupe && Access_id_eleve == AllEleveGroupe[i].id_eleve ){
          let url = window.location.href + '/' + AllEleveGroupe[i].id_eg
          
          let id_eg = AllEleveGroupe[i].id_eg
          console.log("id_eg :", id_eg)
          this.router.navigateByUrl('notes/' + id_eg);
         } 
      }
    })
  }

}

@Component({
  selector: 'dialog-content-mail',
  templateUrl: 'dialog-content-mail.html',
})
export class DialogContentMail {
  constructor(
    public dialogRef: MatDialogRef<DialogContentMail>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'dialog-content-message',
  templateUrl: 'dialog-content-message.html',
})
export class DialogContentMessage {
  constructor(
    public dialogRef: MatDialogRef<DialogContentMessage>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

function delay(milliseconds : number) {
  return new Promise(resolve => setTimeout( resolve, milliseconds));
}
