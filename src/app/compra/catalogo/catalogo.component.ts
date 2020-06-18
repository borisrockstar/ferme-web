import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CompraService } from 'src/app/compra/compra.service';
import { MSJ_ERROR_COMM_SRV } from 'src/app/shared/constantes';
import { FiltrosProductos } from 'src/app/shared/filtros-productos-panel/filtros-productos-panel.component';
import { DATA_SERVICE_ALIASES } from 'src/data/data.service-aliases';
import { EntityDataService } from 'src/data/entity.data.iservice';
import { Producto } from 'src/models/entities/Producto';

@Component({
  selector: 'app-compra-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CompraCatalogoComponent implements OnInit {

  protected productos: Producto[];
  protected productosSource: BehaviorSubject<Producto[]>;
  public productos$: Observable<Producto[]>;

  public cargando: boolean;

  public productoForm: FormGroup;

  constructor(
    @Inject(DATA_SERVICE_ALIASES.products) protected productDataService: EntityDataService<Producto>,
    protected formBuilder: FormBuilder,
    protected snackBarService: MatSnackBar,
    protected service: CompraService,
  ) {
    this.cargando = true;
    this.productos = [];
    this.productosSource = new BehaviorSubject<Producto[]>([]);
    this.productos$ = this.productosSource.asObservable();

    this.productoForm = this.formBuilder.group({
      familia: [null],
      tipo: [{value: null, disabled: true}],
      nombre: ['']
    });

    this.cargando = false;
  }

  public get familia() { return this.productoForm.get('familia'); }
  public get tipo() { return this.productoForm.get('tipo'); }
  public get nombre() { return this.productoForm.get('nombre'); }

  ngOnInit() {
    this.onFiltrosChange({});
  }

  public onFiltrosChange(filtros: FiltrosProductos): void {
    this.cargando = true;
    this.productosSource.next([]);

    let obs: Observable<Producto[]>;

    if (filtros !== {}) {
      obs = this.productDataService.readFiltered(filtros);
    } else {
      obs = this.productDataService.readAll();
    }

    obs.pipe(
      finalize(() => { this.cargando = false; })
    ).subscribe(
      (prods: Producto[]) => {
        this.productosSource.next(prods);
      },
      err => {
        this.snackBarService.open(MSJ_ERROR_COMM_SRV, 'OK', { duration: -1 });
      }
    );
  }

  public onClickAgregarProducto(prod: Producto): void {
    this.service.agregarProducto(prod);
  }

}
