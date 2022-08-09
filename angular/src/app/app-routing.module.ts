import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionComponent } from "./connection/connection.component";
import { ForbiddenComponent } from "./forbidden/forbidden.component";


const routes: Routes = [
  { path: 'frontend/datasource/new', component: ConnectionComponent },
  { path: 'frontend/datasource/edit', component: ConnectionComponent },
  { path: 'frontend/forbidden', component: ForbiddenComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
