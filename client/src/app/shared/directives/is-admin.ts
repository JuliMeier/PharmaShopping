import { Directive, effect, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Account } from '../../core/services/account';

@Directive({
  selector: '[appIsAdmin]'
})
export class IsAdmin  {
  private accountService = inject(Account);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  constructor() { 
    effect(() => {
      if (this.accountService.isAdmin()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });

  }

   
}
