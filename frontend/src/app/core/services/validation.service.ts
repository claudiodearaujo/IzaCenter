import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private translate = inject(TranslateService);

  /**
   * Get translated error message for a form control
   */
  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return this.translate.instant('validation.required');
    }

    if (errors['email']) {
      return this.translate.instant('validation.email');
    }

    if (errors['minlength']) {
      return this.translate.instant('validation.minLength', {
        min: errors['minlength'].requiredLength
      });
    }

    if (errors['maxlength']) {
      return this.translate.instant('validation.maxLength', {
        max: errors['maxlength'].requiredLength
      });
    }

    if (errors['pattern']) {
      return this.translate.instant('validation.pattern');
    }

    if (errors['passwordMismatch']) {
      return this.translate.instant('validation.passwordMismatch');
    }

    // Generic error message
    return this.translate.instant('messages.error.generic');
  }

  /**
   * Check if control has error and was touched
   */
  hasError(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Custom validator: Password confirmation must match
   */
  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clear error if passwords match
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }
}
