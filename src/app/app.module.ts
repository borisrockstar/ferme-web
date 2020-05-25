import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppRoutingModule } from 'src/routing/app-routing.module';
import { AuthGuard } from 'src/routing/auth.guard';
import { FallbackRoutingModule } from 'src/routing/special-routing.module';
import { AppComponent } from './app.component';
import { CompraModule } from './compra/compra.module';
import { GestionModule } from './gestion/gestion.module';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';

const DEBUG_ROUTES = false;

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    GestionModule,
    CompraModule,
    FallbackRoutingModule
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {

  constructor(router: Router) {
    if (DEBUG_ROUTES) {
      this.inspectRouterConfiguration(router);
    }
  }

  // Diagnostic only
  protected inspectRouterConfiguration(router: Router) {
    // Use a custom replacer to display function names in the route configs
    const replacer = (key: any, value: any) => (typeof value === 'function') ? value.name : value;
    console.log('Routes: ', JSON.stringify(router.config, replacer, 2));
  }
}
