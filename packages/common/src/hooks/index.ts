export interface SpeechRecognitionCallbacks {
  onTranscriptChange?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onError?: (error: string) => void;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

/**
 * Класс для управления распознаванием речи.
 */
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private transcript: string = '';
  private isListening: boolean = false;
  private error: string | null = null;
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor(private options: SpeechRecognitionOptions = {}) {
    this.initializeSpeechRecognition();
  }

  /**
   * Инициализирует объект распознавания речи, если API доступен в браузере
   */
  private initializeSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.error = 'Распознавание речи не поддерживается в этом браузере';
      this.notifyError();
      return;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.configureRecognition();
    } catch (err) {
      this.error = `Ошибка инициализации распознавания речи: ${err}`;
      this.notifyError();
    }
  }

  /**
   * Настраивает объект распознавания речи и добавляет обработчики событий
   */
  private configureRecognition(): void {
    if (!this.recognition) return;

    // Настройка параметров распознавания
    this.recognition.lang = this.options.language || 'ru-RU';
    this.recognition.continuous = this.options.continuous ?? true;
    this.recognition.interimResults = this.options.interimResults ?? true;
    this.recognition.maxAlternatives = this.options.maxAlternatives ?? 1;

    // Обработчики событий
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = this.transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcript = finalTranscript;
      this.notifyTranscriptChange(finalTranscript + interimTranscript);
    };

    this.recognition.onerror = (event) => {
      this.error = `Ошибка распознавания: ${event.error}`;
      this.notifyError();
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.notifyListeningChange();
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Автоматический перезапуск, если мы все еще в режиме прослушивания
        try {
          this.recognition?.start();
        } catch (e) {
          this.isListening = false;
          this.notifyListeningChange();
        }
      } else {
        this.isListening = false;
        this.notifyListeningChange();
      }
    };
  }

  /**
   * Начинает прослушивание и распознавание речи
   */
  public startListening(): void {
    if (!this.recognition) {
      this.initializeSpeechRecognition();
      if (!this.recognition) return;
    }

    try {
      this.recognition.start();
    } catch (err) {
      this.error = `Ошибка запуска распознавания: ${err}`;
      this.notifyError();
    }
  }

  /**
   * Останавливает прослушивание и распознавание речи
   */
  public stopListening(): void {
    if (!this.recognition) return;

    try {
      this.isListening = false;
      this.recognition.stop();
    } catch (err) {
      this.error = `Ошибка остановки распознавания: ${err}`;
      this.notifyError();
    }
  }

  /**
   * Сбрасывает текущий транскрипт
   */
  public resetTranscript(): void {
    this.transcript = '';
    this.notifyTranscriptChange('');
  }

  /**
   * Устанавливает колбэки для получения уведомлений об изменениях состояния
   */
  public setCallbacks(callbacks: SpeechRecognitionCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Получает текущий транскрипт
   */
  public getTranscript(): string {
    return this.transcript;
  }

  /**
   * Получает текущее состояние прослушивания
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Получает текущую ошибку, если она есть
   */
  public getError(): string | null {
    return this.error;
  }

  private notifyTranscriptChange(transcript: string): void {
    if (this.callbacks.onTranscriptChange) {
      this.callbacks.onTranscriptChange(transcript);
    }
  }

  private notifyListeningChange(): void {
    if (this.callbacks.onListeningChange) {
      this.callbacks.onListeningChange(this.isListening);
    }
  }

  private notifyError(): void {
    if (this.error && this.callbacks.onError) {
      this.callbacks.onError(this.error);
    }
  }
}
