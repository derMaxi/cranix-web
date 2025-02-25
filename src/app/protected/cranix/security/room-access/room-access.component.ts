import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { SecurityService } from 'src/app/services/security-service';
import { AccessInRoom } from 'src/app/shared/models/secutiry-model';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { ModalController } from '@ionic/angular';
import { AddEditRoomAccessComponent } from './add-edit-room-access/add-edit-room-access.component';
import { YesNoBTNRenderer } from 'src/app/pipes/ag-yesno-renderer';
import { SystemService } from 'src/app/services/system.service';
import { ApplyBTNRenderer } from 'src/app/pipes/ag-apply-renderer';

@Component({
  selector: 'cranix-room-access',
  templateUrl: './room-access.component.html',
  styleUrls: ['./room-access.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoomAccessComponent implements OnInit {
  segment = 'list';
  rowData: AccessInRoom[] = [];
  notActive: boolean = false;
  disabled: boolean = false;
  accessOptions = {};
  context;
  accessApi;
  accessColumnApi;
  statusApi;
  statusColumnApi;
  columnDefs: any[] = [];
  statusColumnDefs: any[] = [];
  defaultColDef;
  modules = [];

  constructor(
    public authService: AuthenticationService,
    private languageS: LanguageService,
    public modalCtrl: ModalController,
    public objectService: GenericObjectService,
    public systemService: SystemService,
    public securityService: SecurityService
  ) {
    this.context = { componentParent: this };
    this.defaultColDef = {
      flex: 1,
      resizable: true,
      wrapText: true,
      autoHeight: true,
      cellStyle: { 'justify-content': "center" },
      minWidth: 100,
      maxWidth: 150,
      suppressMenu: true,
      sortable: false,
      headerComponentParams: {
        template:
          '<div class="ag-cell-label-container" role="presentation">' +
          '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
          '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
          '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>' +
          '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
          '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
          '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>' +
          '    <span ref="eText" class="ag-header-cell-text" role="columnheader" style="white-space: normal;"></span>' +
          '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
          '  </div>' +
          '</div>',
      }
    };
  }

  ngOnInit() {
    this.createColumnDef();
    this.createStatusColumnDefs();
    this.readDatas();
  }

  createStatusColumnDefs() {
    this.statusColumnDefs = [
      {
        field: "id",
        hide: true
      },
      {
        sortable: true,
        headerName: this.languageS.trans('room'),
        field: 'roomName'
      }, {
        headerName: this.languageS.trans('login'),
        field: 'login',
        cellRendererFramework: YesNoBTNRenderer
      }, {
        headerName: this.languageS.trans('portal'),
        field: 'portal',
        cellRendererFramework: YesNoBTNRenderer
      }, {
        headerName: this.languageS.trans('printing'),
        field: 'printing',
        cellRendererFramework: YesNoBTNRenderer
      }
    ];
    if (this.authService.isAllowed('system.proxy')) {
      this.statusColumnDefs.push(
        {
          headerName: this.languageS.trans('proxy'),
          field: 'proxy',
          cellRendererFramework: YesNoBTNRenderer
        }
      )
    }
    this.statusColumnDefs.push({
      headerName: this.languageS.trans('direct'),
      field: 'direct',
      cellRendererFramework: YesNoBTNRenderer
    })
    this.statusColumnDefs.push({
      headerName: this.languageS.trans('Apply Default'),
      field: 'apply_default',
      cellRendererFramework: ApplyBTNRenderer
    })
  }
  toggle(data, field: string, value: boolean) {
    if (this.segment == 'list') {
      this.securityService.modifyAccessInRoom(data);
    } else {
      this.securityService.setAccessStatusInRoom(data);
    }
  }

  toggleButton(data, field: string) {
    data[field] = !data[field]
    if (this.segment == 'list') {
      this.securityService.modifyAccessInRoom(data);
    } else {
      this.securityService.setAccessStatusInRoom(data);
    }
    this.securityService.getActualAccessStatus()
  }

  apply(data: AccessInRoom, rowIndex: number) {
    let sent = false
    for (let access of this.rowData) {
      if (access.roomId == data.roomId && access.accessType == "DEF") {
        this.securityService.setAccessStatusInRoom(access)
        sent = true
        break
      }
    }
    if (sent) {
      this.securityService.getActualAccessStatus()
    } else {
      this.objectService.warningMessage(
        this.languageS.trans("There is no default access status for this room.")
      )
    }
  }
  createColumnDef() {
    this.columnDefs = [];
    for (let key of Object.getOwnPropertyNames(new AccessInRoom())) {
      let col = {};
      col['field'] = key;
      switch (key) {
        case "roomId": {
          col['valueGetter'] = function (params) {
            if (params.data) {
              return params.context['componentParent'].objectService.idToName('room', params.data.roomId);
            }
          }
          col['sortable'] = true;
          break;
        }
        case "pointInTime": {
          col['sortable'] = true;
          break;
        }
        case "action": {
          col['sortable'] = true;
          break;
        }
        case "accessType": {
          //col['headerClass'] = "rotate-header-class"
          col['sortable'] = true;
          break;
        }
        default: {
          col['minWidth'] = 70;
          col['maxWidth'] = 100;
          col['cellRendererFramework'] = YesNoBTNRenderer;
        }
      }
      col['headerName'] = this.languageS.trans(key);
      if (key == 'proxy' && !this.authService.isAllowed('system.proxy')) {
        col['hide'] = true;
      }
      this.columnDefs.push(col);
    }
  }
  onQuickFilterChanged(quickFilter) {
    if (this.segment == 'list') {
      this.accessApi.setQuickFilter((<HTMLInputElement>document.getElementById(quickFilter)).value);
      this.accessApi.doLayout();
    } else {
      this.statusApi.setQuickFilter((<HTMLInputElement>document.getElementById(quickFilter)).value);
      this.statusApi.doLayout();
    }
  }
  headerHeightSetter() {
    var padding = 20;
    var height = headerHeightGetter() + padding;
    if (this.segment == 'list') {
      this.accessApi.setHeaderHeight(height);
      this.accessApi.resetRowHeights();
    } else {
      this.statusApi.setHeaderHeight(height);
      this.statusApi.resetRowHeights();
    }
  }
  segmentChanged(event) {
    console.log(event.detail.value)
    if (event.detail.value == "status") {
      this.securityService.getActualAccessStatus();
      this.objectService.okMessage(this.languageS.trans('Loading data ...'));
    }
    this.segment = event.detail.value;
  }

  readDatas() {
    let sub = this.securityService.getAllAccess().subscribe(
      (val) => { this.rowData = val },
      (err) => { this.authService.log(err) },
      () => { sub.unsubscribe(); }
    );
  }
  accessGridReady(params) {
    this.accessApi = params.api;
    this.accessColumnApi = params.columnApi;
    this.authService.log(this.accessApi);
    this.authService.log(this.accessColumnApi);
  }
  statusGridReady(params) {
    this.statusApi = params.api;
    this.statusColumnApi = params.columnApi;
    this.authService.log(this.accessApi);
    this.authService.log(this.accessColumnApi);
  }
  async redirectToAddEdit(roomAccess: AccessInRoom) {
    let action = "add";
    if (roomAccess) {
      this.objectService.selectedObject = roomAccess;
      action = "modify";
    } else {
      roomAccess = new AccessInRoom();
    }
    const modal = await this.modalCtrl.create({
      component: AddEditRoomAccessComponent,
      cssClass: 'medium-modal',
      componentProps: {
        objectAction: action,
        roomAccess: roomAccess
      },
      animated: true,
      showBackdrop: true
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.authService.log("Object was created or modified or deleted", dataReturned.data)
      }
      this.readDatas();
    });
    (await modal).present();
  }
  restartFirewall() {
    this.systemService.applyServiceState('firewalld', 'activ', 'restart')
  }
  stopFirewall() {
    this.systemService.applyServiceState('firewalld', 'activ', 'false')
  }
  delete() {
    let accessSelected = this.accessApi.getSelectedRows();
    if (accessSelected.length == 0) {
      this.objectService.selectObject();
      return;
    }
    this.disabled = true;
    for (let obj of accessSelected) {
      this.securityService.deleteAccessInRoom(obj.id);
      setTimeout(() => { this.authService.log("World!"); }, 1000);
    }
    this.readDatas();
    this.disabled = false;
  }
}
function headerHeightGetter() {
  var columnHeaderTexts = document.querySelectorAll('.ag-header-cell-text');

  var columnHeaderTextsArray = [];

  columnHeaderTexts.forEach(node => columnHeaderTextsArray.push(node));

  var clientHeights = columnHeaderTextsArray.map(
    headerText => headerText.clientHeight
  );
  var tallestHeaderTextHeight = Math.max(...clientHeights);
  return tallestHeaderTextHeight;
}
