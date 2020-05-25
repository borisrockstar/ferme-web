import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MSJ_ERROR_COMM_SRV, REACTIVE_FORMS_ISOLATE } from 'src/app/shared/constantes';
import { DatosPersonaFormComponent } from 'src/app/shared/datos-persona-form/datos-persona-form.component';
import { GestionSharedHttpService } from 'src/http-services/gestion-shared-http.service';
import { ProveedoresHttpService } from 'src/http-services/proveedores-http.service';
import { Cargo } from 'src/models/Cargo';
import { Proveedor } from 'src/models/Proveedor';

export interface ProveedorFormDialogGestionData {
  proveedor: Proveedor;
}

@Component({
  selector: 'app-proveedor-form-dialog-gestion',
  templateUrl: './proveedor-form-dialog.component.html',
  styleUrls: [
    '../../../../assets/styles/formularios.css',
    './proveedor-form-dialog.component.css'
  ]
})
export class ProveedorFormDialogGestionComponent {

  public proveedor: Proveedor;

  public cargos$: Observable<Cargo[]>;
  public cargando: boolean;
  public guardando: boolean;

  public razonSocial: FormControl;
  @ViewChild('personaForm', { static: true }) public personaForm: DatosPersonaFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: ProveedorFormDialogGestionData,
    protected self: MatDialogRef<ProveedorFormDialogGestionComponent>,
    protected snackBar: MatSnackBar,
    protected fb: FormBuilder,
    protected sharedSvc: GestionSharedHttpService,
    protected httpSvc: ProveedoresHttpService
  ) {
    this.cargando = true;
    this.guardando = false;

    this.razonSocial = this.fb.control('', Validators.required);

    const prov = (this.data && this.data.proveedor) ? this.data.proveedor : new Proveedor();
    this.Proveedor = prov;

    this.cargando = false;
  }

  public get formularioCompleto(): FormGroup {
    const group = this.personaForm ? [this.razonSocial, this.personaForm.formGroup] : [this.razonSocial];
    return this.fb.group(group);
  }

  public get esNuevo() { return this.proveedor ? isNaN(this.proveedor.idProveedor) : true; }


  protected cargarProveedor(prov: Proveedor): void {
    this.proveedor = prov;
    if (prov.razonSocialProveedor) {
      this.razonSocial.setValue(prov.razonSocialProveedor, REACTIVE_FORMS_ISOLATE);
    }
  }

  protected guardarProveedor(prov: Proveedor): void {
    this.formularioCompleto.disable(REACTIVE_FORMS_ISOLATE);
    this.guardando = true;

    this.httpSvc.guardarProveedor(prov).subscribe(
      (id: number) => {
        if (id) {
          if (prov.idProveedor) {
            this.snackBar.open('Proveedor \'' + prov.nombreCompletoPersona + '\' actualizado/a exitosamente.');
          } else {
            this.snackBar.open('Proveedor \'' + prov.nombreCompletoPersona + '\' registrado/a exitosamente.');
          }
          prov.idProveedor = id;
          this.self.close(prov);
        } else {
          this.snackBar.open(MSJ_ERROR_COMM_SRV, 'OK', { duration: -1 });
          this.formularioCompleto.enable(REACTIVE_FORMS_ISOLATE);
          this.guardando = false;
        }
      }, err => {
        this.snackBar.open(MSJ_ERROR_COMM_SRV, 'OK', { duration: -1 });
        this.formularioCompleto.enable(REACTIVE_FORMS_ISOLATE);
        this.guardando = false;
      }
    );
  }

  public onClickAceptar(): void {
    const datosProveedor = {
      idProveedor: this.proveedor.idProveedor ? this.proveedor.idProveedor : null,
      idPersona: this.proveedor.idPersona ? this.proveedor.idPersona : null,
      razonSocialProveedor: this.razonSocial.value
    };
    const prov: Proveedor = Object.assign(
      this.personaForm.persona,
      datosProveedor
    );

    this.guardarProveedor(prov);
  }

  public onClickCancelar(): void {
    this.self.close();
  }

  @Input() public set Proveedor(prov: Proveedor) {
    if (prov) {
      this.cargarProveedor(prov);
    } else {
      this.formularioCompleto.reset();
    }
  }

}
