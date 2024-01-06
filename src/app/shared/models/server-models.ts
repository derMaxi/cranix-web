
/**
 * Thes session modell
 * @description The object recived if the login was succesfull.
 */


export class Crx2fa {
        id: number = 0;
        creatorId: number = 0;
        crx2faType: string = "TOTP";
        crx2faAddress: string = "";
        serial: string = "";
        timeStep: number = 60;
        validHours: number = 2;
}

export class Crx2faSession {
        id: number = 0;
        creatorId: number = 0;
        validHours: number = 2;
        valid: boolean
        token: string
}

/* export interface UserResponse {
  userId: number,
  token: string,
  mac: string,
  name: string,
  role: string,
  dnsName: string,
  roomId: string,
  roomName?: string,
  instituteName?: string,
  mustChange: boolean,
  mustSetup2fa?: boolean,
  fullName: string,
  acls: string[],
  crx2fas?: string[],
  crx2faSession?: Crx2faSession
}
*/
export class UserResponse {
        userId: number;
        token: string;
        mac: string;
        name: string;
        fullName: string;
        role: string;
        dnsName: string;
        roomId: string;
        roomName?: string;
        instituteName?: string;
        mustChange: boolean;
        mustSetup2fa?: boolean;
        crx2faSession?: Crx2faSession
        acls: string[];
        crx2fas?: string[];
}

/**
 * The LoginForm intefrace 
 * @description variables used to login  
 */
export class LoginForm {
        username: string = "";
        password: string = "";
}

export interface ServerResponse {
        id: number,
        code: string,
        value: string,
        sessionId: number,
        objectId: number,
        parameters: string[]

}

export class CrxActionMap {
        objectIds: number[] = [];
        booleanValue: boolean = true;
        longValue: number = 0;
        name: string = "";
        stringValue = "";
}

export class Settings {
        lang: string = "";
        errorMessageDuration: number = 10;
        okMessageDuration: number = 10;
        warningMessageDuration: number = 6;
        lineProPageMD: number = 15;
        agGridThema: string = "ag-theme-alpine";
        rowHeight: number = 35;
        rowMultiSelectWithClick: boolean = true;
        checkboxSelection: boolean = true;
        headerCheckboxSelection: boolean = true;
        debug: boolean = false;
        constructor() { }
}

export class Acl {
        id: number;
        acl: string = "";
        allowed: boolean = true;
        userId: number;
        groupId: number;
}

export class ServiceStatus {
        service: string;
        enabled: string;
        active: string;
}
export const TOKEN = 'cranix-token';
