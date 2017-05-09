import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import * as Quill from 'quill';
import { MeshFieldControlApi } from '../../common/form-generator-models';
import { SchemaField } from '../../../../common/models/schema.model';
import { NodeFieldType } from '../../../../common/models/node.model';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
    selector: 'html-field',
    templateUrl: './html-field.component.html',
    styleUrls: ['./html-field.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HtmlFieldComponent extends BaseFieldComponent implements AfterViewInit, OnDestroy {
    field: SchemaField;
    api: MeshFieldControlApi;
    value: NodeFieldType;
    @HostBinding('class.focus')
    focus: boolean = false;
    @ViewChild('editor')
    private editorRef: ElementRef;
    private editor: Quill.Quill;
    private blurTimer: any;

    constructor(private elementRef: ElementRef) {
        super();
    }

    ngAfterViewInit(): void {
        const editorElement = this.editorRef.nativeElement;
        this.editor = new Quill(editorElement, {
            theme: 'snow'
        });
        this.editor.clipboard.dangerouslyPasteHTML(this.value as string);

        this.editor.on('text-change', this.onTextChangeHandler);
        this.editor.on('selection-change', this.onSelectionChangeHandler);
        this.elementRef.nativeElement.querySelector('.ql-toolbar').addEventListener('click', this.focusHandler);
        this.editorRef.nativeElement.querySelector('.ql-editor').addEventListener('blur', this.blurHandler);
    }

    ngOnDestroy(): void {
        this.editor.off('text-change', this.onTextChangeHandler);
        this.editor.off('selection-change', this.onSelectionChangeHandler);
        this.elementRef.nativeElement.querySelector('.ql-toolbar').removeEventListener('click', this.focusHandler);
        this.editorRef.nativeElement.querySelector('.ql-editor').removeEventListener('blur', this.blurHandler);
    }

    init(api: MeshFieldControlApi): void {
        this.api = api;
        this.value = api.getValue();
        this.setValidity(this.value);
    }

    valueChange(value: NodeFieldType): void {
        this.value = value;
    }

    formWidthChange(): void {
        this.setWidth('100%');
    }

    focusEditor(): void {
        this.editor.focus();
    }

    private focusHandler = () => {
        this.focus = true;
        this.editor.focus();
        clearTimeout(this.blurTimer);
    }

    private blurHandler = () => {
        this.blurTimer = setTimeout(() => {
            this.focus = false;
        }, 50);
    }

    private onTextChangeHandler = () => {
        const value = this.editorRef.nativeElement.querySelector('.ql-editor').innerHTML;
        this.api.setValue(value);
        this.setValidity(value);
    }

    private onSelectionChangeHandler = range => {
        if (range !== null) {
            this.focus = true;
        } else {
            this.blurHandler();
        }
    }

    /**
     * Mark as invalid if field is required and has a falsy value
     */
    private setValidity(value: any): void {
        const quillEmptyValue = '<p><br></p>';
        const isValid = !this.api.field.required || (!!value && value !== quillEmptyValue);
        this.api.setValid(isValid);
    }
}