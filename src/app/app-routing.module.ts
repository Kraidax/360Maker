import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { ClasseComponent } from './classe/classe.component';
import { EleveComponent } from './eleve/eleve.component';
import { GroupeComponent } from './groupe/groupe.component';
import { ProjetComponent } from './projet/projet.component';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'eleve', component: EleveComponent },
  { path: 'classe', component: ClasseComponent },
  { path: 'projet', component: ProjetComponent },
  { path: 'projet/:id_projet', component: GroupeComponent },
  { path: 'login', component: SignInComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }