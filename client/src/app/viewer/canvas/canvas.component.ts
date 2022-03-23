import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild
} from "@angular/core";
import {CanvasSource} from "./source/canvas-source";
import {
	Box3,
	BufferGeometry,
	Camera,
	Intersection,
	Material,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Raycaster,
	Scene,
	TextGeometry,
	Vector2,
	WebGLRenderer
} from "three";
import {Bounds2D, Bounds3D, BoundsUtil} from "./source/util/bounds";
import {ThemeService} from "../../util/theme/theme.service";
import {Observable, Subject, Subscription} from "rxjs";
import {DxfGlobals} from "./source/dxf/util/dxf-globals";
import {DeviceUtil} from "../../util/device-util";
import {DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW} from "@angular/cdk/keycodes";
import {Point} from "@angular/cdk/drag-drop";
import {MTextHandler} from "./source/dxf/handler/mtext-handler";
import colormap from "colormap";
import colorScales from "colormap/colorScale";
import {RoomMapping} from "../../service/room-mapping/room-mapping";
import {LegendComponent} from "../legend/legend.component";
import {ColorSelectService} from "../../service/colorSelect/colorSelect.service";

/**
 * Component where the actual CAD file graphics are drawn on.
 */
@Component({
	selector: "app-canvas-component",
	templateUrl: "canvas.component.html",
	styleUrls: ["canvas.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements OnDestroy, OnInit {

	constructor(
		private readonly cd: ChangeDetectorRef,
		private readonly element: ElementRef,
		private readonly ngRenderer: Renderer2,
		private readonly themeService: ThemeService,
		private colorSelectService: ColorSelectService
	) {
	}

	/**
	 * Get a stream of load events.
	 */
	public get loadEvents(): Observable<LoadEvent> {
		return this.load.asObservable();
	}

	/**
	 * Get the source the component should display.
	 */
	public get source(): CanvasSource {
		return this._source;
	}

	/**
	 * Set the source the component should display.
	 * @param value to set
	 */
	@Input("src")
	public set source(value: CanvasSource) {
		this._source = value;

		this.roomMappings = null;
		this.roomMappingObjects = null;
		this.roomObjects = null;

		if (!!this._source) {
			this.onUpdated(true);
		}
	}

	/**
	 * Default zoom setting.
	 */
	private static readonly DEFAULT_ZOOM: number = 0.9;

	/**
	 * Factor by which to zoom using the mouse wheel.
	 */
	private static readonly MOUSE_WHEEL_SCROLL_SPEED: number = 0.85;

	/**
	 * Acceleration factor for the arrow key navigation.
	 * A factor of for example 0.01 would mean that the movement
	 * speed would accelerate by 1% of the scene width (or height) per second.
	 */
	private static readonly ARROW_KEY_NAVIGATION_ACCELERATION_FACTOR: number = 4.0;

	/**
	 * Factor with which the current speed will be slowed
	 * each second when no arrow key in one direction is active.
	 */
	private static readonly ARROW_KEY_NAVIGATION_SLOW_FACTOR: number = 7.0;

	/**
	 * Maximum speed of the arrow key navigation given as factor of the current
	 * scene width or height.
	 */
	private static readonly ARROW_KEY_NAVIGATION_MAX_SPEED_FACTOR: number = 0.8;

	/**
	 * Minimum speed factor (relative to scene width or height) allowed in the arrow key navigation.
	 */
	private static readonly ARROW_KEY_NAVIGATION_MIN_SPEED_FACTOR: number = 0.01;

	/**
	 * Event emitter emitting events when a file has started or finished rendering/loading.
	 */
	private readonly load: Subject<LoadEvent> = new Subject<LoadEvent>();

	/**
	 * Source that should be displayed by the component.
	 */
	private _source: CanvasSource;

	/**
	 * Current three.js Scene.
	 */
	private readonly scene: Scene = new Scene();

	/**
	 * Current three.js WebGL renderer.
	 */
	private readonly renderer: WebGLRenderer = new WebGLRenderer({
		antialias: true,
		alpha: true
	});

	/**
	 * Current three.js Camera.
	 */
	private camera: Camera;

	/**
	 * The last drawing bounds.
	 */
	private lastBounds: Bounds3D;

	/**
	 * The current viewport.
	 */
	private currentViewport: Bounds2D;

	/**
	 * Whether the canvas is initialized.
	 */
	private initialized = false;

	/**
	 * Whether a repaint is already requested.
	 */
	private repaintRequested = false;

	/**
	 * Whether to repaint again after done with repainting.
	 */
	private repaintAfterDone = false;

	/**
     * Whether to show room labels.
     */
	 private roomLabelsHidden = false;


	/**
	 * Subscription to theme changes.
	 */
	private themeChangeSub: Subscription;

	/**
	 * Event listener for key down events.
	 */
	private windowKeyDownListener: (event: KeyboardEvent) => void;

	/**
	 * Event listener for key up events.
	 */
	private windowKeyUpListener: (event: KeyboardEvent) => void;

	/**
	 * Mouse down listener on the canvas component element.
	 */
	private mouseDownListener: (event: MouseEvent) => void;

	/**
	 * Mouse move listener on the canvas component element.
	 */
	private mouseMoveListener: (event: MouseEvent) => void;

	/**
	 * Mouse up listener on the canvas component element.
	 */
	private mouseUpListener: (event: MouseEvent) => void;

	/**
	 * Mouse wheel event listener on the canvas component element.
	 */
	private mouseWheelListener: (event: WheelEvent) => void;

	/**
	 * Touch start listener on the canvas component element.
	 */
	private touchStartListener: (event: TouchEvent) => void;

	/**
	 * Touch move listener on the canvas component element.
	 */
	private touchMoveListener: (event: TouchEvent) => void;

	/**
	 * Touch end listener on the canvas component element.
	 */
	private touchEndListener: (event: TouchEvent) => void;

	/**
	 * Whether arrow key navigation is currently in progress.
	 */
	private isArrowKeyNavigationInProgress = false;

	/**
	 * Registry for currently pressed keys.
	 */
	private pressedKeyRegistry: PressedKeyRegistry = {
		up: false,
		down: false,
		left: false,
		right: false
	};

	/**
	 * Current speed vector of arrow key navigation.
	 * It is given in percent of the current scene width per second.
	 * For example a vector of [0.01, -0.02] would mean we would
	 * navigate with a speed of 1 % of the scene width per second in horizontal direction (to the right)
	 * and 2% of the scene width in vertical direction (to the top).
	 */
	private currentArrowKeyNavigationSpeedVector: [number, number] = [0, 0];

	/**
	 * Timestamp of the last key navigation step.
	 */
	private lastKeyNavigationTimestamp = -1;

	/**
	 * Whether panning of the scene is in progress.
	 */
	private isPanInProgress = false;

	/**
	 * Mouse position of the panning start.
	 */
	private panStartMousePosition: Point;

	/**
	 * Position of the scenes camera at panning start.
	 */
	private panStartSceneCameraPosition: Point;

	/**
	 * ID of the touch starting panning.
	 */
	private startTouchID: number;

	/**
	 * ID of a second touch used for zooming.
	 */
	private secondTouchIDForZooming = -1;

	/**
	 * Start distance between two fingers for zooming.
	 */
	private startTouchDistanceForZooming: number;

	/**
	 * Start zoom before pinching with two fingers.
	 */
	private startZoomBeforePinching: number;

	/**
	 * Whether mouse wheel scroll is in progress.
	 */
	private isMouseWheelZoomInProgress = false;

	/**
	 * Room mappings to display.
	 */
	private roomMappings: RoomMapping[];

	/**
	 * Objects on the current scene from the current room mapping.
	 */
	private roomMappingObjects: Object3D[];

	/**
	 * Objects that represent a highlighted room (for room mappings).
	 */
	private roomObjects: Object3D[];

	/**
	 * Mapping of room object (three.js) with the UUID of the object to
	 * the actual room mapping data.
	 */
	private roomObjectMapping: Map<string, RoomMapping> = new Map<string, RoomMapping>();

	/**
	 * Color map to use for room mappings.
	 */
	private colorMap: Map<number, number>;

	/**
	 * Whether the legend should be shown.
	 */
	public customBackground = false;

	/**
	 * Whether the legend should be shown.
	 */
	public showLegend = false;

	/**
	 * Current tooltip to display.
	 */
	public tooltip: string | null;

	/**
	 * Whether the tooltip is currently shown.
	 */
	public isTooltipShown = false;

	/**
	 * Position of the tooltip.
	 */
	@ViewChild("tooltipElement")
	public tooltipElement: ElementRef;

	/**
	 * Legend component to display a legend for the current color map for.
	 */
	@ViewChild(LegendComponent)
	public legend: LegendComponent;

	/**
	 * Clear the current scene from any objects previously drawn.
	 */
	private clearScene(): void {
		if (this.initialized) {
			this.scene.remove.apply(this.scene, this.scene.children);
		}
	}

	/**
	 * Called when the current source to display is updated.
	 * @param reset whether to reset the viewport to the initial state
	 */
	private onUpdated(reset: boolean): void {
		this.load.next({
			isLoading: true, progress: 0, continueLoading: () => {
			},
			cancelLoading: () => {
			}
		});

		this.onUpdatedInternal(reset).then(() => {
			this.load.next({
				isLoading: false, progress: 100, continueLoading: () => {
				},
				cancelLoading: () => {
				}
			});
		});
	}

	/**
	 * Internal on update method.
	 * @param reset whether to reset the viewport to the initial state
	 */
	private async onUpdatedInternal(reset: boolean): Promise<void> {
		this.clearScene();

		const bounds: Bounds3D = await this._source.draw(this.scene, async (progress) => {
			return await new Promise<boolean>(
				(resolve) => {
					this.load.next({
						isLoading: true,
						progress,
						continueLoading: () => {
							resolve(true);
						},
						cancelLoading: () => {
							resolve(false);
						}
					});
				}
			);
		});
		this.lastBounds = bounds;

		this.updateViewport(bounds, reset);

		await this.initializeRoomMappings();
		this.repaint();
	}

	/**
	 * Initialize the room mappings in the current scene.
	 */
	private async initializeRoomMappings(): Promise<void> {
		this.load.next({
			isLoading: true, progress: 0, continueLoading: () => {
			},
			cancelLoading: () => {
			}
		});

		if (!!this.roomMappingObjects) {
			// Remove first from current scene
			this.scene.remove.apply(this.scene, this.roomMappingObjects);
			this.roomMappingObjects = null;
			this.roomObjects = null;
		}

		this.roomObjectMapping.clear();

		const textMaterial: Material = new MeshBasicMaterial({color: DxfGlobals.getContrastColor()});
		const materials: Map<number, Material> = new Map<number, Material>();
		if (!!this.roomMappings) {
			this.roomMappingObjects = [];
			this.roomObjects = [];

			let i = 0;
			const maxI: number = this.roomMappings.length;
			for (const mapping of this.roomMappings) {
				// Add mesh in room shape
				let shapeMaterial: Material = materials.get(mapping.category);
				if (!shapeMaterial) {
					shapeMaterial = new MeshBasicMaterial({
						color: this.getMappingColor(mapping.category),
						transparent: true,
						opacity: 0.5
					});
					materials.set(mapping.category, shapeMaterial);
				}

				const shapeGeometry: BufferGeometry = this._source.mapToRoom(mapping, this.scene, this.camera);
				if (!!shapeGeometry) {
					const shapeMesh: Mesh = new Mesh(shapeGeometry, shapeMaterial);
					const shapeBounds: Box3 = new Box3().setFromObject(shapeMesh);
					this.scene.add(shapeMesh);
					this.roomMappingObjects.push(shapeMesh);
					this.roomObjects.push(shapeMesh);
					this.roomObjectMapping.set(shapeMesh.uuid, mapping);

					// Add room name
					if (!!mapping.roomName && mapping.roomName.length > 0) {
						const textGeometry: TextGeometry = new TextGeometry(mapping.roomName, {
							font: MTextHandler.getFont(),
							height: 0,
							size: (shapeBounds.max.y - shapeBounds.min.y) / 25
						});
						const textMesh: Mesh = new Mesh(textGeometry, textMaterial);

						const textBounds: Box3 = new Box3().setFromObject(textMesh);

						textMesh.position.x = shapeBounds.min.x + (shapeBounds.max.x - shapeBounds.min.x) / 2 - (textBounds.max.x - textBounds.min.x) / 2;
						textMesh.position.y = shapeBounds.min.y + (shapeBounds.max.y - shapeBounds.min.y) / 2 - (textBounds.max.y - textBounds.min.y) / 2;
						textMesh.position.z = 1;

						// check if room labels should be hidden or shown
						if (this.roomLabelsHidden === false) {
							this.scene.add(textMesh);
       this.roomMappingObjects.push(textMesh);
						}

					}
				}

				i++;

				const continueLoading: boolean = await new Promise<boolean>(
					resolve => {
						this.load.next({
							isLoading: true,
							progress: i * 100 / maxI,
							continueLoading: () => {
								resolve(true);
							},
							cancelLoading: () => {
								resolve(false);
							}
						});
					}
				);

				if (!continueLoading) {
					break;
				}
			}
		}

		this.load.next({
			isLoading: false, progress: 100, continueLoading: () => {
			},
			cancelLoading: () => {
			}
		});
	}

	/**
	 * The the correct color for the passed mapping category.
	 * @param category to get color for
	 */
	private getMappingColor(category: number): number {
		return this.colorMap.get(category);
	}

	/**
	 * Change the color value of a specific category.
	 */
	public setSpecificColours(): void {

		const message = this.colorSelectService.getCatColor;
		const catNumber: number = parseInt(this.colorSelectService.getCatNumber.toString(), 10);
		const legendMapping = this.legend.mapping;

		const color: number = parseInt(message.substring(1), 16);

		this.colorMap.set(catNumber, color);
		legendMapping.set(catNumber.toString(10), message);

		this.legend.mapping = legendMapping;
		this.showLegend = legendMapping.size > 0;

		if (this.initialized) {
			this.initializeRoomMappings().then(() => this.repaint());
		}
	}

	/**
	 * Change the color value of a specific category.
	 */
	public setBackgroundColor(): void {

		const message = this.colorSelectService.getCatColor;

		this.ngRenderer.setStyle(document.body.getElementsByClassName("mat-app-background")[0], "background-color", message);

	}

	/**
	* enable or disable the room labels.
	*/
	public hideRoomLabels(): void {
		if (this.roomLabelsHidden === false) {
			this.roomLabelsHidden = true;
		} else {
			this.roomLabelsHidden = false;
		}

		this.initializeRoomMappings().then(() => this.repaint());
	}

	/**
	 * Set the passed room mappings to display in the canvas.
	 * @param mappings to set
	 * @param colormapName of the colormap to use
	 */
	public setRoomMappings(mappings: RoomMapping[], colormapName: string = "jet"): void {
		this.roomMappings = mappings;

		this.colorMap = new Map<number, number>();
		const legendMapping: Map<string, string> = new Map<string, string>();
		if (!!this.roomMappings) {
			// Get amount of categories
			const categories: Set<number> = new Set<number>();
			for (const mapping of mappings) {
				categories.add(mapping.category);
			}

			// Create color map based on the amount of categories
			const minShades: number = colorScales[colormapName].length;
			const hexColors: string[] = colormap({
					colormap: colormapName,
					nshades: Math.max(minShades, categories.size),
					format: "hex",
					alpha: 1.0
				});

			const sortedCategories: number[] = Array.from(categories);
			sortedCategories.sort();

			let colorIndex = 0;
			for (const category of sortedCategories) {
				const hexColor: string = hexColors[colorIndex++];
				const color: number = parseInt(hexColor.substring(1), 16);

				this.colorMap.set(category, color);
				legendMapping.set(category.toString(10), hexColor);
			}
		}
		this.legend.mapping = legendMapping;
		this.showLegend = legendMapping.size > 0;

		if (this.initialized) {
			this.initializeRoomMappings().then(() => this.repaint());
		}
	}

	/**
	 * Initialize the rendering.
	 * @param viewport to use for the canvas
	 */
	private initialize(viewport: Bounds2D): void {
		const elementBounds: DOMRect = this.element.nativeElement.getBoundingClientRect();

		const cam: OrthographicCamera = new OrthographicCamera(
			-viewport.width / 2,
			viewport.width / 2,
			viewport.height / 2,
			-viewport.height / 2,
			0,
			2000
		);

		cam.position.z = 10;
		this.camera = cam;

		this.renderer.setPixelRatio(window.devicePixelRatio); // For supporting Hi-DPI screens
		this.renderer.setSize(
			elementBounds.width,
			elementBounds.height,
		);

		this.ngRenderer.appendChild(this.element.nativeElement, this.renderer.domElement);
	}

	/**
	 * Build the viewport of the canvas.
	 * @param bounds original (full) bounds of the scene
	 */
	private buildViewport(bounds: Bounds3D): Bounds2D {
		const viewport: Bounds2D = BoundsUtil.to2DBounds(bounds);

		// Find aspect ratio of the canvas element
		const elementBounds: DOMRect = this.element.nativeElement.getBoundingClientRect();
		const aspectRatio: number = elementBounds.width / elementBounds.height;

		// Transform viewport size with preferred aspect ratio
		const currentAspectRatio: number = viewport.width / viewport.height;
		if (currentAspectRatio < aspectRatio) {
			const newWidth: number = viewport.height * aspectRatio;

			viewport.left -= (newWidth - viewport.width) / 2;
			viewport.width = newWidth;
		} else if (currentAspectRatio > aspectRatio) {
			const newHeight: number = viewport.width / aspectRatio;

			viewport.top -= (newHeight - viewport.height) / 2;
			viewport.height = newHeight;
		}

		return viewport;
	}

	/**
	 * Update the current viewport.
	 * @param bounds original (full) bounds of the scene
	 * @param reset whether to reset the viewport to the initial setup
	 */
	private updateViewport(bounds: Bounds3D, reset: boolean) {
		const viewport: Bounds2D = this.buildViewport(bounds);
		this.currentViewport = viewport;

		if (!this.initialized) {
			this.initialized = true;
			this.initialize(viewport);
		}

		this.updateCameraProjection(viewport, reset);
	}

	/**
	 * Reset the viewport to the initial position and size.
	 */
	public resetViewport(): void {
		if (!!this.lastBounds) {
			this.updateViewport(this.lastBounds, true);
			this.repaint();
		}
	}

	/**
	 * Repaint the canvas.
	 */
	private async repaint(): Promise<void> {
		if (!this.repaintRequested) {
			this.repaintRequested = true;

			return new Promise<void>(
				resolve => window.requestAnimationFrame(() => {
					this.renderer.render(this.scene, this.camera);
					this.repaintRequested = false;

					if (this.repaintAfterDone) {
						this.repaintAfterDone = false;
						this.repaint();
					}

					resolve();
				})
			);
		} else {
			this.repaintAfterDone = true;
		}
	}

	/**
	 * Repaint the scene immediately.
	 */
	private repaintImmediately(): void {
		this.renderer.render(this.scene, this.camera);
	}

	/**
	 * Update the current cameras projection.
	 * @param viewport of the scene
	 * @param reset whether to initialize the camera to the initial position, zoom, etc.
	 */
	private updateCameraProjection(viewport: Bounds2D, reset: boolean): void {
		const elementBounds: DOMRect = this.element.nativeElement.getBoundingClientRect();

		if (this.camera instanceof PerspectiveCamera) {
			this.camera.aspect = elementBounds.width / elementBounds.height;

			if (reset) {
				this.camera.position.z = 1;
				this.camera.position.x = 0;
				this.camera.position.y = 0;
			}

			this.camera.updateProjectionMatrix();
		} else if (this.camera instanceof OrthographicCamera) {
			this.camera.left = -viewport.width / 2;
			this.camera.right = viewport.width / 2;
			this.camera.top = viewport.height / 2;
			this.camera.bottom = -viewport.height / 2;

			if (reset) {
				this.camera.position.z = 1;
				this.camera.position.x = viewport.left + viewport.width / 2;
				this.camera.position.y = viewport.top + viewport.height / 2;
				this.camera.zoom = CanvasComponent.DEFAULT_ZOOM;
			}

			this.camera.updateProjectionMatrix();
		}
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.onInitHandleThemeChanges();
		this.setupUserNavigation();
	}

	/**
	 * Handle theme changes on initialization.
	 */
	private onInitHandleThemeChanges(): void {
		if (this.themeService.darkMode) {
			DxfGlobals.setContrastColor(0xFAFAFA);
			DxfGlobals.setBackgroundColor(0x2C2C2C);
		} else {
			DxfGlobals.setContrastColor(0x2C2C2C);
			DxfGlobals.setBackgroundColor(0xFAFAFA);
		}

		this.themeChangeSub = this.themeService.changes.subscribe(isDarkMode => {
			if (isDarkMode) {
				DxfGlobals.setContrastColor(0xFAFAFA);
				DxfGlobals.setBackgroundColor(0x2C2C2C);
			} else {
				DxfGlobals.setContrastColor(0x2C2C2C);
				DxfGlobals.setBackgroundColor(0xFAFAFA);
			}

			if (!!this.source) {
				this.onUpdated(false);
			}
		});
	}

	/**
	 * Setup the user navigation (keyboard, mouse, touch).
	 */
	private setupUserNavigation(): void {
		this.registerUserNavigationWithKeyboard();
		this.registerUserNavigationUsingMouse();

		if (DeviceUtil.isTouchSupported()) {
			this.registerUserNavigationWithTouch();
		}
	}

	/**
	 * Register user navigation using keyboard input.
	 */
	private registerUserNavigationWithKeyboard(): void {
		this.windowKeyDownListener = event => this.onKeyDown(event);
		this.windowKeyUpListener = event => this.onKeyUp(event);

		window.addEventListener("keydown", this.windowKeyDownListener);
		window.addEventListener("keyup", this.windowKeyUpListener);
	}

	/**
	 * Unregister user navigation using keyboard input.
	 */
	private unregisterUserNavigationWithKeyboard(): void {
		window.removeEventListener("keydown", this.windowKeyDownListener);
		window.removeEventListener("keyup", this.windowKeyUpListener);
	}

	/**
	 * Called when a key on the keyboard is down.
	 * @param event that occurred
	 */
	private onKeyDown(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case UP_ARROW:
			case DOWN_ARROW:
			case LEFT_ARROW:
			case RIGHT_ARROW:
				this.onArrowKeyChanged(event.keyCode, true);
				break;
		}
	}

	/**
	 * Called when a key on the keyboard is up.
	 * @param event that occurred
	 */
	private onKeyUp(event: KeyboardEvent): void {
		switch (event.keyCode) {
			case UP_ARROW:
			case DOWN_ARROW:
			case LEFT_ARROW:
			case RIGHT_ARROW:
				this.onArrowKeyChanged(event.keyCode, false);
				break;
		}
	}

	/**
	 * Called when an arrow keys status has changed..
	 * @param keyCode of the arrow key
	 * @param isDown whether the key is currently down
	 */
	private onArrowKeyChanged(keyCode: number, isDown: boolean): void {
		switch (keyCode) {
			case UP_ARROW:
				this.pressedKeyRegistry.up = isDown;
				break;
			case DOWN_ARROW:
				this.pressedKeyRegistry.down = isDown;
				break;
			case LEFT_ARROW:
				this.pressedKeyRegistry.left = isDown;
				break;
			case RIGHT_ARROW:
				this.pressedKeyRegistry.right = isDown;
				break;
		}

		if (isDown && this.isKeyboardNavigationAllowed()) {
			this.startArrowKeyNavigation();
		}
	}

	/**
	 * Check whether keyboard navigation is currently allowed.
	 */
	private isKeyboardNavigationAllowed(): boolean {
		return !this.isPanInProgress;
	}

	/**
	 * Start the arrow key navigation of the scene.
	 */
	private startArrowKeyNavigation(): void {
		if (this.isArrowKeyNavigationInProgress) {
			return;
		}

		this.isArrowKeyNavigationInProgress = true;

		let keyNavigationFunction: () => void;
		keyNavigationFunction = () => {
			window.requestAnimationFrame((timestamp) => {
				if (!this.isArrowKeyNavigationInProgress) {
					return; // Break loop
				}

				const isInitialLoop: boolean = this.lastKeyNavigationTimestamp === -1;

				// Get time difference in millseconds between now and the last animation frame.
				const diff: number = !isInitialLoop ? timestamp - this.lastKeyNavigationTimestamp : 0;
				this.lastKeyNavigationTimestamp = timestamp;

				// Accelerate or slow the current speed vector based on
				// whether the keys are currently pressed.
				let currentXSpeed: number = this.currentArrowKeyNavigationSpeedVector[0];
				let currentYSpeed: number = this.currentArrowKeyNavigationSpeedVector[1];

				if (this.pressedKeyRegistry.up) {
					currentYSpeed += this.currentViewport.height * CanvasComponent.ARROW_KEY_NAVIGATION_ACCELERATION_FACTOR * diff / 1000;
				} else if (this.pressedKeyRegistry.down) {
					currentYSpeed -= this.currentViewport.height * CanvasComponent.ARROW_KEY_NAVIGATION_ACCELERATION_FACTOR * diff / 1000;
				} else {
					// Slow vertical speed down to zero
					if (currentYSpeed > 0) {
						currentYSpeed = Math.max(0, currentYSpeed - currentYSpeed * CanvasComponent.ARROW_KEY_NAVIGATION_SLOW_FACTOR * diff / 1000);
					} else {
						currentYSpeed = Math.min(0, currentYSpeed - currentYSpeed * CanvasComponent.ARROW_KEY_NAVIGATION_SLOW_FACTOR * diff / 1000);
					}

					if (Math.abs(currentYSpeed) < CanvasComponent.ARROW_KEY_NAVIGATION_MIN_SPEED_FACTOR * this.currentViewport.height) {
						currentYSpeed = 0;
					}
				}

				if (this.pressedKeyRegistry.left) {
					currentXSpeed -= this.currentViewport.width * CanvasComponent.ARROW_KEY_NAVIGATION_ACCELERATION_FACTOR * diff / 1000;
				} else if (this.pressedKeyRegistry.right) {
					currentXSpeed += this.currentViewport.width * CanvasComponent.ARROW_KEY_NAVIGATION_ACCELERATION_FACTOR * diff / 1000;
				} else {
					// Slow horizontal speed down to zero
					if (currentXSpeed > 0) {
						currentXSpeed = Math.max(0, currentXSpeed - currentXSpeed * CanvasComponent.ARROW_KEY_NAVIGATION_SLOW_FACTOR * diff / 1000);
					} else {
						currentXSpeed = Math.min(0, currentXSpeed - currentXSpeed * CanvasComponent.ARROW_KEY_NAVIGATION_SLOW_FACTOR * diff / 1000);
					}

					if (Math.abs(currentXSpeed) < CanvasComponent.ARROW_KEY_NAVIGATION_MIN_SPEED_FACTOR * this.currentViewport.width) {
						currentXSpeed = 0;
					}
				}

				// Correct speeds that exceed the maximum speed
				const xSpeedFactor: number = Math.abs(currentXSpeed) / this.currentViewport.width;
				if (xSpeedFactor > CanvasComponent.ARROW_KEY_NAVIGATION_MAX_SPEED_FACTOR) {
					currentXSpeed = currentXSpeed / xSpeedFactor * CanvasComponent.ARROW_KEY_NAVIGATION_MAX_SPEED_FACTOR;
				}

				const ySpeedFactor: number = Math.abs(currentYSpeed) / this.currentViewport.height;
				if (ySpeedFactor > CanvasComponent.ARROW_KEY_NAVIGATION_MAX_SPEED_FACTOR) {
					currentYSpeed = currentYSpeed / ySpeedFactor * CanvasComponent.ARROW_KEY_NAVIGATION_MAX_SPEED_FACTOR;
				}

				this.currentArrowKeyNavigationSpeedVector[0] = currentXSpeed;
				this.currentArrowKeyNavigationSpeedVector[1] = currentYSpeed;

				// Adjust camera position using the current speed vector
				if (currentXSpeed !== 0 || currentYSpeed !== 0 || isInitialLoop) {
					this.camera.position.x += currentXSpeed * diff / 1000;
					this.camera.position.y += currentYSpeed * diff / 1000;

					// Re-render the scene
					this.repaintImmediately();

					keyNavigationFunction();
				} else {
					// Leave key navigation rendering loop, as there is no more movement
					this.lastKeyNavigationTimestamp = -1;
					this.isArrowKeyNavigationInProgress = false;
				}
			});
		};

		keyNavigationFunction();
	}

	/**
	 * Register user navigation using mouse input.
	 */
	private registerUserNavigationUsingMouse(): void {
		this.mouseDownListener = event => this.onMouseDown(event);
		this.mouseMoveListener = event => this.onMouseMove(event);
		this.mouseUpListener = event => this.onMouseUp(event);
		this.mouseWheelListener = event => this.onMouseWheel(event);

		this.element.nativeElement.addEventListener("mousedown", this.mouseDownListener);
		this.element.nativeElement.addEventListener("mousemove", this.mouseMoveListener);
		this.element.nativeElement.addEventListener("mouseup", this.mouseUpListener);
		this.element.nativeElement.addEventListener("wheel", this.mouseWheelListener);
	}

	/**
	 * Unregister user navigation using mouse input.
	 */
	private unregisterUserNavigationWithMouse(): void {
		this.element.nativeElement.removeEventListener("mousedown", this.mouseDownListener);
		this.element.nativeElement.removeEventListener("mousemove", this.mouseMoveListener);
		this.element.nativeElement.removeEventListener("mouseup", this.mouseUpListener);
		this.element.nativeElement.removeEventListener("wheel", this.mouseWheelListener);
	}

	/**
	 * Called on a mouse wheel event on the canvas component element.
	 * @param event that occurred
	 */
	private onMouseWheel(event: WheelEvent): void {
		event.preventDefault();

		// Check whether to zoom in or out
		const zoomIn: boolean = event.deltaY > 0;

		if (this.camera instanceof OrthographicCamera) {
			if (zoomIn) {
				this.camera.zoom *= CanvasComponent.MOUSE_WHEEL_SCROLL_SPEED;
			} else {
				this.camera.zoom /= CanvasComponent.MOUSE_WHEEL_SCROLL_SPEED;
			}

			this.camera.updateProjectionMatrix();
			this.repaintImmediately();
		}
	}

	/**
	 * Called on mouse down on the canvas component element.
	 * @param event that occurred
	 */
	private onMouseDown(event: MouseEvent): void {
		const isLeftButton: boolean = event.button === 0;

		if (isLeftButton) {
			this.initializePanning(event.clientX, event.clientY);
		}
	}

	/**
	 * Called on mouse move event on the canvas component element.
	 * @param event that occurred
	 */
	private onMouseMove(event: MouseEvent): void {
		this.pan(event.clientX, event.clientY);

		this.getObjectNearestToMouse(event.clientX, event.clientY);
	}

	/**
	 * Get the room mapping object nearest to the given coordinates.
	 * @param x coordinate of the mouse
	 * @param y coordinate of the mouse
	 */
	private getObjectNearestToMouse(x: number, y: number): void {
		if (!this.roomObjects) {
			return;
		}

		const vector: Vector2 = new Vector2(
			(x * window.devicePixelRatio / this.renderer.domElement.width) * 2 - 1,
			-(y * window.devicePixelRatio / this.renderer.domElement.height) * 2 + 1
		);
		const ray: Raycaster = new Raycaster();
		ray.setFromCamera(vector, this.camera);

		const intersections: Intersection[] = ray.intersectObjects(this.roomObjects, false);
		if (intersections.length > 0) {
			const intersection: Intersection = intersections[0];

			const mapping: RoomMapping = this.roomObjectMapping.get(intersection.object.uuid);
			if (!!mapping && !!mapping.description && mapping.description.length > 0) {
				if (!this.isTooltipShown || this.tooltip !== mapping.description) {
					this.isTooltipShown = true;
					this.tooltip = mapping.roomName + "<br>" + mapping.description ; //added roomName to tooltip
					this.cd.markForCheck();
				}

				this.ngRenderer.setStyle(this.tooltipElement.nativeElement, "left", `${x + 5}px`);
				this.ngRenderer.setStyle(this.tooltipElement.nativeElement, "top", `${y + 5}px`);
				this.ngRenderer.setStyle(this.tooltipElement.nativeElement, "display", `inline-block`);

				return;
			}
		}

		if (this.isTooltipShown) {
			this.isTooltipShown = false;
			this.ngRenderer.setStyle(this.tooltipElement.nativeElement, "display", `none`);
			this.cd.markForCheck();
		}
	}

	/**
	 * Called on mouse up on the canvas component element.
	 * @param event that occurred
	 */
	private onMouseUp(event: MouseEvent): void {
		this.stopPanning();
	}

	/**
	 * Initialize the panning process at the passed mouse or touch coordinates.
	 * @param x coordinate of the mouse or finger
	 * @param y coordinate of the mouse or finger
	 */
	private initializePanning(x: number, y: number): void {
		if (!this.isPanningAllowed()) {
			return;
		}

		this.isPanInProgress = true;

		this.panStartMousePosition = {
			x,
			y
		};
		this.panStartSceneCameraPosition = {
			x: this.camera.position.x,
			y: this.camera.position.y
		};
	}

	/**
	 * Pan the current scene for the given current x and y coordinate
	 * that respond for example the current mouse or finger position.
	 * @param x coordinate of the mouse or finger
	 * @param y coordinate of the mouse or finger
	 */
	private pan(x: number, y: number): void {
		if (this.isPanInProgress && this.isPanningAllowed()) {
			const elementBounds: DOMRect = this.element.nativeElement.getBoundingClientRect();

			const zoom: number = this.camera instanceof OrthographicCamera ? this.camera.zoom : 1.0;

			const xDiffFactor: number = (x - this.panStartMousePosition.x) / elementBounds.width / zoom;
			const yDiffFactor: number = (y - this.panStartMousePosition.y) / elementBounds.height / zoom;

			this.camera.position.x = this.panStartSceneCameraPosition.x - xDiffFactor * this.currentViewport.width;
			this.camera.position.y = this.panStartSceneCameraPosition.y + yDiffFactor * this.currentViewport.height;

			this.repaint();
		}
	}

	/**
	 * Check whether panning is currently allowed.
	 */
	private isPanningAllowed(): boolean {
		return !this.isArrowKeyNavigationInProgress;
	}

	/**
	 * Stop the panning process.
	 */
	private stopPanning(): void {
		this.isPanInProgress = false;
	}

	/**
	 * Register user navigation using touch input.
	 */
	private registerUserNavigationWithTouch(): void {
		this.touchStartListener = event => this.onTouchStart(event);
		this.touchMoveListener = event => this.onTouchMove(event);
		this.touchEndListener = event => this.onTouchEnd(event);

		this.element.nativeElement.addEventListener("touchstart", this.touchStartListener);
		this.element.nativeElement.addEventListener("touchmove", this.touchMoveListener);
		this.element.nativeElement.addEventListener("touchend", this.touchEndListener);
	}

	/**
	 * Unregister user navigation using touch input.
	 */
	private unregisterUserNavigationWithTouch(): void {
		this.element.nativeElement.removeEventListener("touchstart", this.touchStartListener);
		this.element.nativeElement.removeEventListener("touchmove", this.touchMoveListener);
		this.element.nativeElement.removeEventListener("touchend", this.touchEndListener);
	}

	/**
	 * Called on touch start on the canvas component element.
	 * @param event that occurred
	 */
	private onTouchStart(event: TouchEvent): void {
		if (event.touches.length === 1 && !this.isPanInProgress) {
			const touch: Touch = event.changedTouches[0];
			this.startTouchID = touch.identifier;

			this.initializePanning(touch.clientX, touch.clientY);
		} else if (event.touches.length === 2 && this.secondTouchIDForZooming === -1) {
			this.secondTouchIDForZooming = event.touches[1].identifier;

			this.startTouchDistanceForZooming = Math.hypot(
				event.touches[1].clientX - event.touches[0].clientX,
				event.touches[1].clientY - event.touches[0].clientY
			);

			if (this.camera instanceof OrthographicCamera) {
				this.startZoomBeforePinching = this.camera.zoom;
			}
		}
	}

	/**
	 * Called on the touch move event on the canvas component element.
	 * @param event that occurred
	 */
	private onTouchMove(event: TouchEvent): void {
		if (event.touches.length === 2 && this.secondTouchIDForZooming != -1) {
			// Zoom by pinching
			const currentFingerDistance: number = Math.hypot(
				event.touches[1].clientX - event.touches[0].clientX,
				event.touches[1].clientY - event.touches[0].clientY
			);

			if (this.camera instanceof OrthographicCamera) {
				this.camera.zoom = this.startZoomBeforePinching * currentFingerDistance / this.startTouchDistanceForZooming;
				this.camera.updateProjectionMatrix();
				this.repaint();
			}
			return;
		}

		if (event.changedTouches.length === 1) {
			const touch: Touch = event.changedTouches[0];

			if (touch.identifier === this.startTouchID) {
				this.pan(touch.clientX, touch.clientY);
			}
		}
	}

	/**
	 * Called on touch end on the canvas component element.
	 * @param event that occurred
	 */
	private onTouchEnd(event: TouchEvent): void {
		for (let i = 0; i < event.changedTouches.length; i++) {
			const touch: Touch = event.changedTouches[i];
			if (touch.identifier === this.startTouchID) {
				this.stopPanning();
			} else if (touch.identifier === this.secondTouchIDForZooming) {
				this.secondTouchIDForZooming = -1; // Stop zooming by pinching
			}
		}
	}

	/**
	 * Called on the component destruction.
	 */
	public ngOnDestroy(): void {
		this.scene.dispose();
		this.renderer.dispose();

		this.load.complete();

		this.themeChangeSub.unsubscribe();

		this.unregisterUserNavigationWithKeyboard();
		this.unregisterUserNavigationWithMouse();
		this.unregisterUserNavigationWithTouch();

		this.isMouseWheelZoomInProgress = false;
		this.isArrowKeyNavigationInProgress = false;

	}

	/**
	 * Listener on the windows resize event.
	 */
	@HostListener("window:resize", ["$event"])
	public onWindowResize(event: Event): void {
		const bounds: DOMRect = this.element.nativeElement.getBoundingClientRect();

		// Update renderers canvas size
		this.renderer.setSize(bounds.width, bounds.height);

		if (!!this.lastBounds) {
			this.updateViewport(this.lastBounds, false);
			this.repaint();
		}
	}

}

/**
 * Load events published by the canvas component.
 */
export interface LoadEvent {

	/**
	 * Current progress in range [0; 100].
	 */
	progress: number;

	/**
	 * Whether loading is in progress.
	 */
	isLoading: boolean;

	/**
	 * Function that must be called to continue loading.
	 */
	continueLoading: () => void;

	/**
	 * Function that must be called to cancel loading.
	 */
	cancelLoading: () => void;

}

/**
 * Registry for currently pressed arrow keys.
 */
interface PressedKeyRegistry {

	/**
	 * Whether the left key is currently down.
	 */
	left: boolean;

	/**
	 * Whether the right key is currently down.
	 */
	right: boolean;

	/**
	 * Whether the top key is currently down.
	 */
	up: boolean;

	/**
	 * Whether the bottom key is currently down.
	 */
	down: boolean;

}
