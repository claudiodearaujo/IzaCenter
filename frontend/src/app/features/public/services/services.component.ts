import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TranslateModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  private translate = inject(TranslateService);

  get services() {
    return [
      {
        icon: '🔮',
        title: this.translate.instant('services.items.readingByQuestions.title'),
        description: this.translate.instant('services.items.readingByQuestions.description'),
        features: [
          this.translate.instant('services.items.readingByQuestions.features.feature1'),
          this.translate.instant('services.items.readingByQuestions.features.feature2'),
          this.translate.instant('services.items.readingByQuestions.features.feature3'),
          this.translate.instant('services.items.readingByQuestions.features.feature4')
        ],
        price: this.translate.instant('services.items.readingByQuestions.price')
      },
      {
        icon: '✨',
        title: this.translate.instant('services.items.liveSession.title'),
        description: this.translate.instant('services.items.liveSession.description'),
        features: [
          this.translate.instant('services.items.liveSession.features.feature1'),
          this.translate.instant('services.items.liveSession.features.feature2'),
          this.translate.instant('services.items.liveSession.features.feature3'),
          this.translate.instant('services.items.liveSession.features.feature4')
        ],
        price: this.translate.instant('services.items.liveSession.price')
      },
      {
        icon: '📿',
        title: this.translate.instant('services.items.monthlyReading.title'),
        description: this.translate.instant('services.items.monthlyReading.description'),
        features: [
          this.translate.instant('services.items.monthlyReading.features.feature1'),
          this.translate.instant('services.items.monthlyReading.features.feature2'),
          this.translate.instant('services.items.monthlyReading.features.feature3'),
          this.translate.instant('services.items.monthlyReading.features.feature4')
        ],
        price: this.translate.instant('services.items.monthlyReading.price')
      },
      {
        icon: '🌟',
        title: this.translate.instant('services.items.specialReading.title'),
        description: this.translate.instant('services.items.specialReading.description'),
        features: [
          this.translate.instant('services.items.specialReading.features.feature1'),
          this.translate.instant('services.items.specialReading.features.feature2'),
          this.translate.instant('services.items.specialReading.features.feature3'),
          this.translate.instant('services.items.specialReading.features.feature4')
        ],
        price: this.translate.instant('services.items.specialReading.price')
      }
    ];
  }
}
