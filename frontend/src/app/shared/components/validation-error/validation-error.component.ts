import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'app-validation-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-error.component.html',
  styleUrl: './validation-error.component.css'
})
export class ValidationErrorComponent {
  @Input() control: AbstractControl | null = null;

  validationService = inject(ValidationService);
}
