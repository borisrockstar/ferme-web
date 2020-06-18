import { Injectable } from '@angular/core';
import { HttpService } from 'src/data/http/http.abstract-service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from 'src/models/entities/Cliente';
import { retry, map } from 'rxjs/operators';
import { EntityDataService } from '../entity.data.iservice';

@Injectable()
export class ClientesHttpDataService
  extends HttpService
  implements EntityDataService<Cliente> {

  protected baseURI = this.baseURI + '/gestion/clientes';

  constructor(
    protected http: HttpClient
  ) {
    super();
  }
  readById(id: string | number): Observable<Cliente> {
    throw new Error('Method not implemented.');
  }
  readFiltered(f: any): Observable<Cliente[]> {
    throw new Error('Method not implemented.');
  }
  update(emp: Cliente, id: string | number): Observable<Cliente> {
    throw new Error('Method not implemented.');
  }

  public readAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(
      this.baseURI
    ).pipe(
      retry(2)
    );
  }

  public create(cli: Cliente): Observable<Cliente> {
    return this.http.post<number>(
      this.baseURI + '/guardar',
      cli
    ).pipe(
      map(id => {
        cli.id = id;
        return cli;
      })
    );
  }

  public deleteById(idCliente: number): Observable<boolean> {
    return this.http.post<boolean>(
      this.baseURI + '/borrar',
      idCliente
    );
  }
}
