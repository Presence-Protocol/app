declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

if (!Date.prototype.toRelativeTimeString) {
  Date.prototype.toRelativeTimeString = function(): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - this.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return this.toLocaleDateString();
  };
}

export {}; 