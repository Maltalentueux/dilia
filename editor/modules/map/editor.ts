import {Component, ViewChild} from '@angular/core';
import {AfterViewInit, OnDestroy} from '@angular/core';
import {WebGLSurface, CommitModal} from '../../components';
import {ChipsetModal} from './chipset-upload';
import {ChipsetService} from './chipset.service';
import {MapService} from './map.service';
import {CreateNewMapModal, NewMap} from './createnewmap';
import {OpenMap} from './open-map.component';
import {MapManager, Map} from '../../models/map';
import {MapStatusExtra} from '../../shared';

import {EditorState} from './editor-state';
import {Brush} from './editor-state/brush';
import {PaletteArea} from './editor-state/palette-area';
import {EditorArea} from './editor-state/editor-area';


let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');

@Component({
    selector: 'map-editor',
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate,
    providers: [
        ChipsetService, EditorState, Brush,
        EditorArea, PaletteArea, MapService,
    ]
})
export class MapEditor implements AfterViewInit, OnDestroy {

    @ViewChild('surface')
    private surface: WebGLSurface;
    @ViewChild('chipsetupload')
    private chipset_modal: ChipsetModal;
    @ViewChild('newmapmodal')
    private create_map_modal: CreateNewMapModal;
    @ViewChild('commitmap')
    private commit_modal: CommitModal;
    @ViewChild('openmapmodal')
    private open_map_modal: OpenMap;

    constructor(
        private state: EditorState,
        private map_manager: MapManager
    ) {}

    currentMapIsReadOnly() {
        return this.map_manager.currentMap() === undefined;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    openMap(map: MapStatusExtra) {
        this.map_manager.openMap(map.id, !map.locked)
            .subscribe(opened_map => {
                this.state.edit(opened_map);
            });
    }

    ngOnDestroy(): void {
        this.state.cleanUp();
    }

    openMapDialog(): void {
        this.open_map_modal.show();
    }

    createNewMap(): void {
        this.create_map_modal.clear();
        this.create_map_modal.show();
    }

    commit(): void {
        let _map = this.map_manager.currentMap();
        if (_map) {
            // Create a local variable to force the type
            // to `Map`. There's seems to be a bug in tsc.
            // Without that statement, the closure capture
            // a `map` object of type `Map | undefined` instead.
            let map = _map;
            this.commit_modal.show(map);
            this.state.getMapPreview().subscribe(prev => {
                map.preview = prev;
            });
        }
    }

    /// This is a hook to be used only by
    /// the template when a layer is being selected
    onSelectLayer(id: number): void {
        this.state.onSelectLayer(id);
    }

    /// This is a hook to be used only by
    /// the template when a map is being created
    onNewMap(new_map: NewMap): void {
        this.map_manager.createMap(
            new_map.name,
            new_map.width,
            new_map.height);
        this.state.edit(this.map_manager.currentMap() as Map);
    }

    ngAfterViewInit(): void {
        this.state.init(this.surface);
        let map = this.map_manager.currentMap();
        if (map) {
            this.state.edit(this.map_manager.currentMap() as Map);
        }
    }
}
