import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {ThemeService} from "./util/theme/theme.service";
import {Subscription} from "rxjs";

/**
 * Main component of the application.
 */
@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {

	/**
	 * Whether dark mode is enabled.
	 */
	public isDarkMode = false;

	/**
	 * Subscription to changes of the theme.
	 */
	private themeChangesSub: Subscription;

	constructor(
		private readonly renderer: Renderer2,
		private readonly element: ElementRef,
		private readonly themeService: ThemeService
	) {
		this.renderer.addClass(element.nativeElement, "mat-app-background");
	}

	/**
	 * Called on theme change.
	 * @param darkMode whether dark mode is enabled.
	 */
	private onThemeChange(darkMode: boolean) {
		if (darkMode) {
			this.renderer.removeStyle(document.body.getElementsByClassName("mat-app-background")[0], "background-color");
			this.renderer.addClass(document.body, "theme-alternate");
		} else {
			this.renderer.removeStyle(document.body.getElementsByClassName("mat-app-background")[0], "background-color");
			this.renderer.removeClass(document.body, "theme-alternate");
		}
	}

	/**
	 * Called on component destruction.
	 */
	public ngOnDestroy(): void {
		this.themeChangesSub.unsubscribe();
	}

	/**
	 * Called on component initialization.
	 */
	public ngOnInit(): void {
		this.isDarkMode = this.themeService.darkMode;
		this.onThemeChange(this.isDarkMode);
		this.themeChangesSub = this.themeService.changes.subscribe((darkMode) => {
			this.isDarkMode = darkMode;
			this.onThemeChange(this.isDarkMode);
		});
	}

}
