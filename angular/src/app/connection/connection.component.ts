import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ConnectionService } from "./connection.service";
import { DataSource } from "./datasource.model";
import { ActivatedRoute, Router } from "@angular/router";
import _isEqual from 'lodash.isequal';

export interface PatchObject {
    path: string,
    op: string,
    value: string
}

@Component({
    selector: 'app-connection',
    templateUrl: './connection.component.html',
    styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {

    CONNECTION_TYPE = 'example-connector';
    datasource: DataSource = {
        id: '',
        name: '',
        configuration: {
            username: '',
            password: ''
        },
        type: this.CONNECTION_TYPE
    };
    form: FormGroup;
    step: number = 1;
    shareCollection: boolean = true;
    collectionDescription: string = '';
    showValidateLoader: boolean;
    datalakeUrls: string[];
    showConnectionCreateError: boolean = false;
    targetOrigin: string;
    editDataSource: boolean = false;
    stepOneInvalid: boolean = false;
    stepTwoInvalid: boolean = false;
    errorMessage: string;
    validatingConfiguration: boolean = false;
    validationCompleted: boolean = true;
    appName: string;
    initialValuesForDataSourceForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private connectionService: ConnectionService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit(): void {
        this.connectionService.getConfig().subscribe(data => {
            this.datalakeUrls = data['datalakeUrls'];
            this.appName = data['appName'];
            const {id, frontend} = this.activatedRoute.snapshot.queryParams
            // check if the frontend target specified by the parent matches any of the datalakeUrls
            // otherwise show a 403
            if (frontend && this.datalakeUrls.indexOf(frontend) > -1) {
                this.targetOrigin = frontend;
            } else {
                this.router.navigate(['/frontend/forbidden']);
            }
        });
        this.buildForm();
    }

    next() {
        switch (this.step) {
            case 1:
                this.validateConfiguration();
                break;
            case 2:
                this.createOrUpdateConnection();
                break;
        }
    }

    back() {
        if (this.step !== 1) {
            this.step--;
        } else if (this.step === 1) {
            window.parent.postMessage({'close': false, 'back': true, 'done': false}, this.targetOrigin)
        }
    }

    closeIframe() {
        window.parent.postMessage({'close': true}, this.targetOrigin);
    }


    private validateConfiguration() {
        if (this.form.get('configuration').invalid) {
            this.stepOneInvalid = true;
            return;
        }
        this.validatingConfiguration = true;
        this.stepOneInvalid = false;
        window.parent.postMessage({
                'close': false,
                'back': false,
                'done': false,
                'configuration': this.form.get('configuration').value,
            },
            this.targetOrigin);
    }

    @HostListener('window:message', ['$event'])
    parentEvent($event: MessageEvent) {
        const {data} = $event;
        if (data && data['id']) {
            this.datasource = data;
            this.datasource.type = this.CONNECTION_TYPE;
            this.editDataSource = true;
            this.buildForm();
            this.initialValuesForDataSourceForm = this.form.getRawValue();
        }
        if (data && data['errorMessage']) {
            this.showConnectionCreateError = true;
            this.errorMessage = data['errorMessage'];
        }
    }

    private createOrUpdateConnection() {
        const dataSourceNameControl: AbstractControl = this.form.get('name');
        if (dataSourceNameControl.invalid) {
            this.stepThreeInvalid = true;
            return;
        }
        this.stepThreeInvalid = false;
        const dataSourceData = {type: this.datasource.type, ...this.form.value}
        if (this.editDataSource) {
            this.datasource.configuration.accessKey = null;
            window.parent.postMessage({
                    'close': false,
                    'back': false,
                    'done': true,
                    'patchData': this.getPatchData(this.datasource),
                    'dataSourceId': this.datasource.id,
                    'edit': this.editDataSource,
                    'create-collection': false
                },
                this.targetOrigin);
        } else {
            window.parent.postMessage({
                    'close': false,
                    'back': false,
                    'done': true,
                    'datasource': dataSourceData,
                    'edit': this.editDataSource,
                    'create-collection': this.shareCollection
                },
                this.targetOrigin);
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            name: [this.datasource.name, [Validators.required]],
            configuration: this.formBuilder.group({
                username: [this.datasource.configuration.username, [Validators.required]],
                password: [this.datasource.configuration.password, [Validators.required]],
            })
        });
    }

    private getPatchData(datasource: DataSource): PatchObject[] {
        let patchRequestData: PatchObject[] = [];
        for (let datasourceKey in datasource) {
            if (datasourceKey == 'name' && this.form.get(datasourceKey)
                && this.valueHasChanged(datasource[datasourceKey], this.form.get(datasourceKey).value)) {
                const patchObject: PatchObject = {
                    'path': `/${datasourceKey}`,
                    'op': 'replace',
                    'value': this.form.get(datasourceKey).value
                }
                patchRequestData.push(patchObject);
            } else if (datasourceKey === 'configuration') {
                for (let configKey in datasource[datasourceKey]) {
                    let configKeyFormControl = this.form.get(`${datasourceKey}.${configKey}`);
                    if (configKeyFormControl
                        && this.valueHasChanged(datasource[datasourceKey][configKey], configKeyFormControl.value)) {
                        const patchObject: PatchObject = {
                            'path': `/${datasourceKey}/${configKey}`,
                            'op': 'replace',
                            'value': configKeyFormControl.value
                        }
                        patchRequestData.push(patchObject);
                    }
                }
            }
        }
        return patchRequestData;
    }

    private valueHasChanged(previousValue: string, newValue: string) {
        if (!previousValue && !newValue) {
            return false;
        }
        return !_isEqual(previousValue, newValue);
    }

    showBackButton() {
        return !(this.editDataSource && this.step === 1);
    }
}
