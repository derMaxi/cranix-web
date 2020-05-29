import { Component, OnInit } from '@angular/core';

import { LanguageService } from 'src/app/services/language.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security-service';
import { YesNoTextBTNRenderer } from 'src/app/pipes/ag-yesno-text-renderer';

@Component({
  selector: 'cranix-proxy',
  templateUrl: './proxy.component.html',
  styleUrls: ['./proxy.component.scss'],
})
export class ProxyComponent implements OnInit {

  segment='basic';
  proxyData: any[];
  proxyOptions;
  context;
  proxyApi;
  proxyColumnApi;
  proxySelected;
  columnDefs: any[];

  constructor(
    public authService: AuthenticationService,
    private languageS: LanguageService,
    public securityService: SecurityService
  )
  {
    this.context = { componentParent: this };
    this.proxyOptions = {
      columnDefs: this.columnDefs,
      context: this.context,
      rowSelection: 'multiple',
      rowHeight: 30
    };
    this.readDatas().then(val=> {
      this.proxyData = val;
      this.columnDefs = [{
         field: 'name',
	 headerName: this.languageS.trans('name'),
	 suppressMenu: true,
	 sortable: true
      }];
      console.log(this.proxyData);
      for( let key of Object.getOwnPropertyNames(val[0]) ) {
         let col = {};
         if( key != "name" ) {
	   col['field'] = key;
	   col['width'] = 100;
	   col['sortable'] = false;
	   col['suppressMenu'] = true;
	   col['headerName'] = this.languageS.trans(key);
	   col['cellRendererFramework'] = YesNoTextBTNRenderer;
	   this.columnDefs.push(col);
	 }
      }
      console.log(this.columnDefs);
    });
  }

  ngOnInit() {
  }
  segmentChanged(event) {
    this.segment = event.detail.value;
  }

  readDatas(): Promise<any[]> {
    return new Promise((resolve, reject) => {
    this.securityService.getProxyBasic().subscribe(
      (val) => { resolve(val) },
      (err) => { console.log(err) }
      )
      });
  }
  proxyGridReady(params) {
    this.proxyApi = params.api;
    this.proxyColumnApi = params.columnApi;
    console.log("proxyGridReady");
  }
  proxySelectionChanged() {
    this.proxySelected = this.proxyApi.getSelectedRows();
  }

  addEditPositiveList(positiveList) {
    //TODO
  }
  writeConfig() {
    //TODO
  }
  restartProxy() {
    //TODO
  }

}
