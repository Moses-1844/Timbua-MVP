// enhanced-time-ago.pipe.ts
import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private subscription: Subscription | null = null;
  private value: Date | string = '';
  private transformedText: string = '';

  transform(value: Date | string): string {
    if (!value) return '';
    
    this.value = value;
    this.updateText();
    
    // Update every minute for real-time updates
    if (!this.subscription) {
      this.subscription = interval(60000).subscribe(() => {
        this.updateText();
      });
    }
    
    return this.transformedText;
  }

  private updateText(): void {
    const date = new Date(this.value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    this.transformedText = this.calculateTimeAgo(seconds);
  }

  private calculateTimeAgo(seconds: number): string {
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
      }
    }
    
    return 'just now';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}