import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ViewerComponent} from "./viewer/viewer.component";
import {AppComponent} from "./app.component";

const routes: Routes = [];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
