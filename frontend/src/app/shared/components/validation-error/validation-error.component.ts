import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'app-validation-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (validationService.hasError(control)) {
      <small class="text-red-600 text-xs mt-1 block">
        {{ validationService.getErrorMessage(control) }}
      </small>
    }
  `,
  styles: []
})
export class ValidationErrorComponent {
  @Input() control: AbstractControl | null = null;

  validationService = inject(ValidationService);
}
