import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatTable, MatDialog } from '@angular/material';
import { Observable, of } from 'rxjs';
import { Venta } from 'src/models/Venta';
import { VentasHttpService } from 'src/http-services/ventas.service';
import { REACTIVE_FORMS_ISOLATE as NO_EVENT_CHAIN, VENTA_TIPO_BOLETA, VENTA_TIPO_FACTURA } from 'src/assets/common/Constants';
import { DetalleVenta } from 'src/models/DetalleVenta';
import { Empleado } from 'src/models/Empleado';
import { Cliente } from 'src/models/Cliente';
import { EmpleadosHttpService } from 'src/http-services/empleados.service';
import { ClientesHttpService } from 'src/http-services/clientes.service';
import { AgregarProductoVentaComponent } from './agregar-producto/agregar-producto.component';
import { Producto } from 'src/models/Producto';

export interface VentaFormularioDialogData {
  venta: Venta;
}

export interface TipoVenta {
  codigo: string;
  descripcion: string;
}

export const TIPOS_VENTA: TipoVenta[] = [
  { codigo: VENTA_TIPO_BOLETA, descripcion: "Boleta" },
  { codigo: VENTA_TIPO_FACTURA, descripcion: "Factura" }
]

@Component({
  selector: 'app-venta-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: [
    '../../gestion-formularios.css',
    'formulario.component.css'
  ]
})
export class VentaFormularioComponent implements OnInit {

  private _idVenta: number;


  public tipos$: Observable<TipoVenta[]>;
  public empleados$: Observable<Empleado[]>;
  public clientes$: Observable<Cliente[]>;
  public showSpinner$: Observable<boolean>;

  public ventaForm: FormGroup;
  @ViewChild("tablaDetalles") public tablaDetalles: MatTable<DetalleVenta>;
  public displayedColumns: string[];

  public fechaVenta: string;
  public detallesVenta: DetalleVenta[];
  public subtotalVenta: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: VentaFormularioDialogData,
    private self: MatDialogRef<VentaFormularioComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private httpSvc: VentasHttpService,
    private empHttpSvc: EmpleadosHttpService,
    private clHttpSvc: ClientesHttpService,
    private dialog: MatDialog
  ) { 
    this.showSpinner$ = of(true);
    this.tipos$ = of(TIPOS_VENTA);

    this.fechaVenta = (new Date()).toLocaleDateString();
    this.detallesVenta = [];
    this.subtotalVenta = 0;
    this.displayedColumns = [ "producto", "precio", "cantidad", "acciones" ];

    this.ventaForm = this.fb.group({
      tipo: [null, Validators.required],
      empleado: [null],
      cliente: [null, Validators.required]
    });

    if (this.dialogData) {
      const prov: Venta = this.dialogData.venta;
      if (prov) { this.cargarVenta(prov); }
    }
  }

  public get tipo() { return this.ventaForm.get("tipo"); }
  public get empleado() { return this.ventaForm.get("empleado"); }
  public get cliente() { return this.ventaForm.get("cliente"); }

  public get esNueva() { return !isNaN(this._idVenta); }

  ngOnInit() {
    this.clientes$ = this.clHttpSvc.listarClientes();
    this.empleados$ = this.empHttpSvc.listarEmpleados();

    this.tablaDetalles.dataSource = of(this.detallesVenta);
  }

  private cargarVenta(vnt: Venta): void {

    this.ventaForm.disable(NO_EVENT_CHAIN);
    this.showSpinner$ = of(true);

    this._idVenta = vnt.idVenta;

    this.tipo.setValue(vnt.tipoVenta, NO_EVENT_CHAIN);
    this.cliente.setValue(vnt.idCliente, NO_EVENT_CHAIN);

    if (vnt.idEmpleado) {
      this.empleado.setValue(vnt.idEmpleado, NO_EVENT_CHAIN);
    }

    this.fechaVenta = vnt.fechaVenta;
    this.detallesVenta = vnt.detallesVenta;
    this.subtotalVenta = vnt.subtotalVenta;

    this.showSpinner$ = of(false);
    this.ventaForm.enable();
  }

  private guardarVenta(vnt: Venta): void {
    this.ventaForm.disable(NO_EVENT_CHAIN);
    this.showSpinner$ = of(true);
    
    this.httpSvc.guardarVenta(vnt).subscribe(
      (id: number) => {
        if (id) {
          if (vnt.idVenta) {
            this.snackBar.open("Venta N° '"+vnt.idVenta+"' actualizada exitosamente.");
          } else {
            this.snackBar.open("Venta N° '"+id+"' registrada exitosamente.");
          }
          vnt.idVenta = id;
          this.self.close(vnt);
        } else {
          this.snackBar.open("Error al guardar venta.");
        }
      }, err => {
        console.log(err);
        this.snackBar.open("Error al guardar venta.");
        this.showSpinner$ = of(false);
        this.ventaForm.enable(NO_EVENT_CHAIN);
      }
    );
  }

  public onClickAgregarProductos(): void {
    this.dialog.open(AgregarProductoVentaComponent, { 
      width: "37rem", 
      height: "42rem"
    })
      .beforeClosed().subscribe(
        (productos: Producto[]) => {
          if (productos && productos.length > 0) {
            productos.forEach(
              (prod: Producto, i: number) => {
                let dtl: DetalleVenta = new DetalleVenta();
                dtl.idProducto = prod.idProducto;
                dtl.nombreProducto = prod.nombreProducto;
                dtl.precioProducto = prod.precioProducto;
                dtl.unidadesProducto = 1;
                this.detallesVenta.push(dtl);
                if (i === productos.length) {
                  this.tablaDetalles.dataSource = of(this.detallesVenta);
                }
              }
            );
          }
        }
      );
  }

  public onClickIncrementarCantidadProducto(index: number): void {
    const detalle: DetalleVenta = this.detallesVenta[index];
    if (detalle) {
      detalle.unidadesProducto++;
      this.tablaDetalles.dataSource = of(this.detallesVenta);
    }
  }

  public onClickReducirCantidadProducto(index: number): void {
    const detalle: DetalleVenta = this.detallesVenta[index];
    if (detalle) {
      detalle.unidadesProducto--;
      this.tablaDetalles.dataSource = of(this.detallesVenta);
    }
  }

  public onClickAceptar(): void {
    let nuevo: Venta = {
      idVenta: this._idVenta? this._idVenta : null,
      tipoVenta: this.tipo.value,
      fechaVenta: this.fechaVenta? this.fechaVenta: null,
      idCliente: this.cliente.value,
      idEmpleado: this.empleado.value,
      detallesVenta: this.detallesVenta,
      subtotalVenta: null
    };

    this.guardarVenta(nuevo);
  }

  public onClickCancelar(): void {
    this.self.close();
  }

  @Input() public set Venta(emp: Venta) {
    if (emp) {
      this.cargarVenta(emp);
    } else {
      this.ventaForm.reset();
    }
  }

}