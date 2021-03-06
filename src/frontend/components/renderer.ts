import { ExperimentRegistryService } from './../services/experiment-registry';
import {
  Component,
  ComponentRef,
  Injector,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ExperimentFactoryService } from '../services/experiment-factory';

import { highlight, languages } from 'prismjs';

@Component({
  selector: 'cl-renderer',
  template: `
<div class="case" #caseContainer></div>
<details *ngIf="source">
  <summary style="margin: 1em auto">Source</summary>
  <pre class="language-html"><code [innerHTML]="highlight(source, 'html')"></code></pre>
</details>
<details *ngIf="style">
  <summary style="margin: 1em auto">Source</summary>
  <pre class="language-html"><code [innerHTML]="highlight(style, 'css')"></code></pre>
</details>
<details *ngIf="context">
  <summary style="margin: 1em auto">Source</summary>
  <pre class="language-html"><code [innerHTML]="highlight(context | json, 'json')"></code></pre>
</details>
`,
  styles: [`
details{
  transition: opacity 0.5s ease-in;
  transition: max-height 0.5s ease-in;
}
details:not([open])>pre{
  opacity: 0;
  max-height: 0px;
  overflow: hidden;
}
details[open]>pre{
  opacity: 1;
  max-height: 700px;
  overflow: auto;
}
`]
})
export class RendererComponent implements OnDestroy {
  private _ref: ComponentRef<any>;
  public source: string;
  public context: Object;
  public style: string;
  @ViewChild('caseContainer', { read: ViewContainerRef }) public caseContainer: ViewContainerRef;

  constructor(
    private experimentFactory: ExperimentFactoryService,
    private experimentRegistry: ExperimentRegistryService,
    private injector: Injector,
  ) { }

  highlight(source: string, language: string){
    return highlight(source, languages['language']);
  }

  private _cleanup() {
    if (this._ref) {
      this._ref.destroy();
      this._ref = null;
    }
  }

  @Input() set id(id: string) {
    this._cleanup();

    const { factory, injector } = this.experimentFactory.compileComponent(id, this.injector);

    this._ref = this.caseContainer.createComponent(factory, 0, injector, []);
    const experimentCase = this.experimentRegistry.getExperimentCase(id);
    this.source = experimentCase.showSource ? experimentCase.template : '';
    this.style = experimentCase.showSource ? experimentCase.styles.join('\n') : '';
    this.context = experimentCase.showSource ? experimentCase.context : {};
  }

  ngOnDestroy() {
    this._cleanup();
  }
}
